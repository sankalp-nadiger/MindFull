import axios from "axios";

export const getDistrictAndState = async (lat, lng) => {
  try {
    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    const { data } = await axios.get(url);
    const components = data?.results?.[0]?.address_components;

    if (!components) return { district: null, state: null };

    let district = null;
    let state = null;

    for (const comp of components) {
      if (comp.types.includes("administrative_area_level_2")) {
        district = comp.long_name;
      }
      if (comp.types.includes("administrative_area_level_1")) {
        state = comp.long_name;
      }
    }

    return { district, state };
  } catch (err) {
    console.error("Reverse geocoding error:", err.message);
    return { district: null, state: null };
  }
};
