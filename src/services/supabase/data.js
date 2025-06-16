import { supabase } from './auth';

// Clothes functions
export const getClothes = async (limit = null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return { data: [], error: null };
    }

    let query = supabase
      .from('clothes')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (limit) {
      query = query.limit(limit);
    }
    
    const { data: clothes, error } = await query;
    
    if (error) throw error;
    return { data: clothes || [], error: null };
  } catch (error) {
    console.error('Error in getClothes:', error);
    return { data: [], error };
  }
};

export const addClothing = async (name, type, filePath, styles = [], occasions = [], color = '', material = '', brand = '', season = '', fit = '', notes = '', description = '') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clothes')
      .insert([{ 
        name,
        type,
        image_path: filePath,
        user_id: user.id,
        created_at: new Date().toISOString(),
        styles,
        occasions,
        color,
        material,
        brand,
        season,
        fit,
        notes,
        description
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateClothing = async (id, name, type, styles = [], occasions = [], color = '', material = '', brand = '', season = '', fit = '', notes = '', description = '') => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clothes')
      .update({ 
        name,
        type,
        styles,
        occasions,
        color,
        material,
        brand,
        season,
        fit,
        notes,
        description
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const deleteClothing = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First get the clothing item to get the image path for cleanup
    const { data: clothing, error: fetchError } = await supabase
      .from('clothes')
      .select('image_path')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError) throw fetchError;

    // Delete the clothing item from database
    const { error: deleteError } = await supabase
      .from('clothes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id); // Ensure user can only delete their own items
    
    if (deleteError) throw deleteError;

    // Optionally delete the image from storage
    if (clothing?.image_path) {
      const { error: storageError } = await supabase.storage
        .from('userclothes')
        .remove([clothing.image_path]);
      
      if (storageError) {
        console.warn('Failed to delete image from storage:', storageError);
        // Don't throw error for storage cleanup failure
      }
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Outfits functions
export const getOutfits = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return { data: [], error: null };
    }

    // First get all outfits
    const { data: outfits, error } = await supabase
      .from('outfits')
      .select(`
        *,
        outfit_items(
          clothes(*)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Then get all favorites for the current user
    const { data: favorites, error: favError } = await supabase
      .from('favourites')
      .select('outfit_id')
      .eq('user_id', user.id);

    if (favError) throw favError;

    // Create a set of favorited outfit IDs for quick lookup
    const favoritedOutfitIds = new Set(favorites?.map(fav => fav.outfit_id) || []);

    // Transform the data to match the expected format
    const transformedOutfits = outfits?.map(outfit => {
      return {
        id: outfit.id,
        title: outfit.name,
        image: outfit.image_path,
        isFavorite: favoritedOutfitIds.has(outfit.id),
        items: outfit.outfit_items?.map(item => ({
          id: item.clothes?.id,
          image: item.clothes?.image_path
        })) || []
      };
    }) || [];

    return { data: transformedOutfits, error: null };
  } catch (error) {
    console.error('Error in getOutfits:', error);
    return { data: [], error };
  }
};

export const addOutfit = async (name, clothingIds, imagePath) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First create the outfit
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert([{ 
        name,
        user_id: user.id,
        image_path: imagePath,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (outfitError) throw outfitError;

    // Then create the outfit items
    const outfitItems = clothingIds.map(clothingId => ({
      outfit_id: outfit.id,
      clothing_id: clothingId
    }));

    const { error: itemsError } = await supabase
      .from('outfit_items')
      .insert(outfitItems);
    
    if (itemsError) throw itemsError;

    return { data: outfit, error: null };
  } catch (error) {
    console.error('Error adding outfit:', error);
    return { data: null, error };
  }
};

export const deleteOutfit = async (outfitId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // First check if the outfit exists and is favorited
    const { data: existingOutfit, error: checkError } = await supabase
      .from('outfits')
      .select(`
        id,
        image_path,
        favourites!left(id)
      `)
      .eq('id', outfitId)
      .single();

    if (checkError) throw checkError;
    if (!existingOutfit) throw new Error('Outfit not found');

    // First remove from favorites if it exists
    if (existingOutfit.favourites) {
      const { error: favoritesError } = await supabase
        .from('favourites')
        .delete()
        .eq('outfit_id', outfitId);

      if (favoritesError) throw favoritesError;
    }

    // Delete the outfit items
    const { error: itemsError } = await supabase
      .from('outfit_items')
      .delete()
      .eq('outfit_id', outfitId);

    if (itemsError) throw itemsError;

    // Delete the outfit itself
    const { error: outfitError } = await supabase
      .from('outfits')
      .delete()
      .eq('id', outfitId)
      .eq('user_id', user.id);

    if (outfitError) throw outfitError;

    // Delete the outfit image from storage if it exists
    if (existingOutfit.image_path) {
      const { error: storageError } = await supabase.storage
        .from('userclothes')
        .remove([existingOutfit.image_path]);
      
      if (storageError) {
        console.warn('Failed to delete outfit image from storage:', storageError);
        // Don't throw error for storage cleanup failure
      }
    }

    // Immediately refresh both outfits and favorites lists
    const [outfitsResult, favoritesResult] = await Promise.all([
      getOutfits(),
      getFavorites()
    ]);

    // Return the refreshed data immediately
    return {
      data: {
        success: true,
        outfits: outfitsResult.data || [],
        favorites: favoritesResult.data || []
      },
      error: null
    };
  } catch (error) {
    console.error('Error deleting outfit:', error);
    return { data: null, error };
  }
};

// Favorites functions
export const getFavorites = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return { data: [], error: null };
    }

    const { data: favorites, error } = await supabase
      .from('favourites')
      .select(`
        *,
        outfits!left(
          id,
          name,
          image_path,
          user_id,
          created_at,
          outfit_items(
            clothes(
              id,
              image_path
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Ensure favorites is an array
    const favoritesArray = favorites || [];

    // Transform the data to match the expected format
    const transformedFavorites = favoritesArray
      .filter(favorite => favorite && favorite.outfits) // Filter out null/undefined favorites and outfits
      .map(favorite => ({
        id: favorite.outfits.id,
        title: favorite.outfits.name,
        image: favorite.outfits.image_path,
        isFavorite: true,
        items: (favorite.outfits.outfit_items || [])
          .filter(item => item && item.clothes) // Filter out null/undefined items and clothes
          .map(item => ({
            id: item.clothes.id,
            image: item.clothes.image_path
          }))
      }));

    return { data: transformedFavorites, error: null };
  } catch (error) {
    console.error('Error in getFavorites:', error);
    return { data: [], error };
  }
};

export const isOutfitFavorited = async (outfitId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: false, error: null };

    const { data, error } = await supabase
      .from('favourites')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) throw error;
    return { data: !!data, error: null };
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return { data: false, error };
  }
};

export const toggleFavorite = async (outfitId) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { data: null, error: new Error('User not authenticated') };

    // First check if the outfit is already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favourites')
      .select('id')
      .eq('outfit_id', outfitId)
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (checkError) throw checkError;

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('favourites')
        .delete()
        .eq('id', existing.id);
      
      if (deleteError) throw deleteError;

      // Refresh both lists after removing from favorites
      const [outfitsResult, favoritesResult] = await Promise.all([
        getOutfits(),
        getFavorites()
      ]);

      return { 
        data: { 
          isFavorite: false,
          outfits: outfitsResult.data || [],
          favorites: favoritesResult.data || []
        }, 
        error: null 
      };
    } else {
      // Add to favorites
      const { data: newFavorite, error: insertError } = await supabase
        .from('favourites')
        .insert([{ 
          outfit_id: outfitId, 
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;

      // Refresh both lists after adding to favorites
      const [outfitsResult, favoritesResult] = await Promise.all([
        getOutfits(),
        getFavorites()
      ]);

      return { 
        data: { 
          isFavorite: true,
          outfits: outfitsResult.data || [],
          favorites: favoritesResult.data || []
        }, 
        error: null 
      };
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error);
    return { data: null, error };
  }
};

// Profile functions
export const ensureProfile = async (user) => {
  try {
    // First check if profile exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code === 'PGRST116') {
      // Profile doesn't exist, create it
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([{
          id: user.id,
          email: user.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (createError) throw createError;
      return { data: newProfile, error: null };
    }

    if (fetchError) throw fetchError;
    return { data: existingProfile, error: null };
  } catch (error) {
    console.error('Error ensuring profile:', error);
    return { data: null, error };
  }
};

// Add a new function to refresh favorites
export const refreshFavorites = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('No authenticated user found');
      return { data: [], error: null };
    }

    const { data: favorites, error } = await supabase
      .from('favourites')
      .select(`
        *,
        outfits!left(
          id,
          name,
          image_path,
          user_id,
          created_at,
          outfit_items(
            clothes(
              id,
              image_path
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Ensure favorites is an array
    const favoritesArray = favorites || [];

    // Transform the data to match the expected format
    const transformedFavorites = favoritesArray
      .filter(favorite => favorite && favorite.outfits) // Filter out null/undefined favorites and outfits
      .map(favorite => ({
        id: favorite.outfits.id,
        title: favorite.outfits.name,
        image: favorite.outfits.image_path,
        isFavorite: true,
        items: (favorite.outfits.outfit_items || [])
          .filter(item => item && item.clothes) // Filter out null/undefined items and clothes
          .map(item => ({
            id: item.clothes.id,
            image: item.clothes.image_path
          }))
      }));

    return { data: transformedFavorites, error: null };
  } catch (error) {
    console.error('Error refreshing favorites:', error);
    return { data: [], error };
  }
};
