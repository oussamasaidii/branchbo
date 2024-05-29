// import fetch from "node-fetch";
import { charactersCollection } from "./database";
import { Datum, Datum2 } from "./interfaces";
export async function fetchAndSaveCharacters() {
  try {
    const response = await fetch("https://fortnite-api.com/v2/cosmetics/br/search/all?type=outfit&api_key=3ca10d0e-b9d0-4dac-9940-14a45dcd9572");
    if (response.ok) {
      const data = await response.json();
      const datum: Datum[] = data.data.slice(0, 500);

      const filter: Datum[] = datum.filter(item => {
        return item.name.length < 10 && item.name !== "TBD" && item.name !== "NPC" && item.name !== "null" && item.images.featured != null;
      });

      for (const item of filter) {
        const existingCharacter = await charactersCollection.findOne({ id: item.id });
        if (!existingCharacter) {
          const character: Datum2 = {
            numId: parseInt(item.id, 10),
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
          await charactersCollection.insertOne(character);
          console.log(`Character ${character.name} inserted into the database`);
        } else {
          console.log(`Character ${item.name} already exists in the database`);
        }
      }
    } else {
      throw new Error("Failed to fetch characters from the Fortnite API.");
    }
  } catch (error) {
    console.error("Error fetching characters:", error);
  }
}


