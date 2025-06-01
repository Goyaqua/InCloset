import { supabase } from './auth';

// Clothes functions
export const getClothes = async () => {
  try {
    const { data: clothes, error } = await supabase
      .from('clothes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return { data: clothes, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const addClothing = async (name, type, filePath) => {
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
        created_at: new Date().toISOString()
      }])
      .select()
      .single();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const updateClothing = async (id, name, type) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('clothes')
      .update({ 
        name,
        type
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own items
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
    const { data: outfits, error } = await supabase
      .from('outfits')
      .select(`
        *,
        outfit_items(
          clothes(*)
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Transform the data to match the expected format
    const transformedOutfits = outfits.map(outfit => ({
      id: outfit.id,
      title: outfit.name,
      items: outfit.outfit_items.map(item => ({
        id: item.clothes.id,
        image: item.clothes.image_url
      }))
    }));

    return { data: transformedOutfits, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const addOutfit = async (name, clothingIds) => {
  try {
    // First create the outfit
    const { data: outfit, error: outfitError } = await supabase
      .from('outfits')
      .insert([{ name }])
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
    return { data: null, error };
  }
};

export const deleteOutfit = async (id) => {
  try {
    const { error } = await supabase
      .from('outfits')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    return { error };
  }
};

// Favorites functions
export const getFavorites = async () => {
  try {
    const { data: favorites, error } = await supabase
      .from('favourites')
      .select(`
        outfits(
          *,
          outfit_items(
            clothes(*)
          )
        )
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;

    // Transform the data to match the expected format
    const transformedFavorites = favorites.map(favorite => ({
      id: favorite.outfits.id,
      title: favorite.outfits.name,
      items: favorite.outfits.outfit_items.map(item => ({
        id: item.clothes.id,
        image: item.clothes.image_url
      }))
    }));

    return { data: transformedFavorites, error: null };
  } catch (error) {
    return { data: null, error };
  }
};

export const toggleFavorite = async (outfitId) => {
  try {
    // First check if the outfit is already favorited
    const { data: existing, error: checkError } = await supabase
      .from('favourites')
      .select()
      .eq('outfit_id', outfitId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;

    if (existing) {
      // Remove from favorites
      const { error: deleteError } = await supabase
        .from('favourites')
        .delete()
        .eq('outfit_id', outfitId);
      
      if (deleteError) throw deleteError;
    } else {
      // Add to favorites
      const { error: insertError } = await supabase
        .from('favourites')
        .insert([{ outfit_id: outfitId }]);
      
      if (insertError) throw insertError;
    }

    return { error: null };
  } catch (error) {
    return { error };
  }
};
