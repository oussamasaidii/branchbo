// import fetch from "node-fetch";
import { charactersCollection } from "./database";
import { Datum } from "./interfaces";

export async function fetchAndSaveCharacters() {
  try {
    const response = await fetch("https://fortnite-api.com/v2/cosmetics/br/search/all?type=outfit&api_key=3ca10d0e-b9d0-4dac-9940-14a45dcd9572");
    if(response.ok)
      {
        const data = await response.json();
        const datum : Datum[] = data.data.slice(0,500);
        const filter : Datum[] = datum.filter(item => {
          return item.name.length < 10 && item.name != "TBD" && item.name != "NPC" && item.name != "null" && item.images.featured != null;})
          const filteredData = filter.map(item => {
            return {
              numId: parseInt(item.id), 
              id: item.id,
              name: item.name,
              description: item.description,
              type: item.type,
              rarity: item.rarity,
              introduction: item.introduction,
              images: item.images,
              wins: 0, 
              losses: 0, 
              itemA: "", 
              itemB: "", 
              isFavortite: false, 
              isBlacklisted: false, 
              reasonBlacklist: "", 
              favouriteDescription: "",
            };
        });
          if(filter.length > 0)
            {
              await charactersCollection.insertMany(filteredData);
            }
      }
    else {
      throw new Error("Failed to fetch characters from the Fortnite API.");
    }
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
}
