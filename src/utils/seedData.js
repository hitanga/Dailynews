import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import heroCityStreetImg from "../assets/images/hero_city_street_1790345223275.jpg";

export const DEFAULT_POSTS = [
  {
    title: "At daybreak of the fifteenth day of my search",
    imageUrl: heroCityStreetImg,
    description: "When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay before me in the morning haze, the silent towers of stone and steel seemed to watch like ancient sentinels. The avenue was already beginning to stir with yellow cabs cutting through the cool morning air, their tires hissing on the damp asphalt.\n\nEvery corner in this city tells a layered story of migration, ambition, and quiet solitude. Stepping into the street, the sun broke through the narrow chasm between skyscrapers, casting long golden shadows along the crosswalk.",
    category: "News",
    dateString: "February 1, 2019",
    commentsCount: 4,
    isHero: true,
  },
  {
    title: "The sunset faded to twilight",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    description: "I began walking, therefore, in a big curve, seeking some point of vantage and continually looking around for the faint remnants of day. The deep blue cast settled over the rooftops as the streetlamps flickered to life one by one, signaling the beginning of the quiet hours in the creative quarter.\n\nPhotography in low light demands patience and a keen awareness of ambient light sources.",
    category: "News",
    dateString: "April 11, 2019",
    commentsCount: 2,
  },
  {
    title: "Did You Know? Coffee Beans Are Actually Fruit Seeds",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    description: "Despite being called beans, coffee comes from the pits of bright red fruits called coffee cherries. In ancient Ethiopia, nomadic tribes did not brew liquid coffee; instead, they mixed whole ripe coffee cherries with animal fat to create high-energy snack clusters for long journeys!\n\nToday, over 2.25 billion cups of coffee are consumed around the world every single day, making it the second most traded commodity after crude oil.",
    category: "Fun Facts",
    dateString: "April 8, 2019",
    commentsCount: 5,
  },
  {
    title: "Two long weeks I wandered along the highway",
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    description: "Through two long weeks I wandered, stumbling through the nights guided only by the stars and highway lights ahead. The hum of the motorcycle engine became a rhythmic meditation across open lanes.\n\nTraveling solo on two wheels changes one's perception of distance and landscape.",
    category: "News",
    dateString: "April 8, 2019",
    commentsCount: 1,
  },
  {
    title: "Honey Never Spoils: 3,000-Year-Old Edible Honey in Egyptian Tombs",
    imageUrl: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80",
    description: "Archaeologists excavating ancient Egyptian tombs frequently find pots of honey that are thousands of years old and still completely preserved and edible. Because of honey's unique low moisture content and natural hydrogen peroxide production, bacteria and microorganisms cannot survive in it.\n\nBees must visit approximately two million flowers just to produce a single pound of honey!",
    category: "Fun Facts",
    dateString: "February 14, 2019",
    hasCameraBadge: true,
    commentsCount: 3,
  },
  {
    title: "Global Financial Markets Shift as Central Banks Signal Rate Pauses",
    imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
    description: "When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay before me, morning traffic started to flow like an endless ribbon along the boulevard.\n\nThe architecture of urban canyons frames light in unexpected geometries, revealing textures in brick and glass that go unnoticed in the rush of everyday life.",
    category: "News",
    dateString: "February 1, 2019",
    commentsCount: 4,
  },
  {
    title: "Why Flamingos Are Born Grey and Turn Pink from Their Diet",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    description: "Baby flamingos hatch with dull grey or white plumage. Their famous bright pink and coral feathers are entirely the result of their diet! In the wild, flamingos consume brine shrimp and blue-green algae packed with carotenoid pigments, which their liver metabolizes and deposits into their growing feathers.\n\nIf a flamingo stops eating carotenoid-rich foods, its feathers will eventually fade back to pale white.",
    category: "Fun Facts",
    dateString: "January 16, 2019",
    commentsCount: 3,
  },
  {
    title: "The Great Wall of China is Held Together by Sticky Rice Mortar",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    description: "During the Ming dynasty over 600 years ago, Chinese bricklayers formulated an innovative composite mortar by blending slaked lime with sticky amylose rice broth! The amylopectin in the sticky rice reacted chemically to create an incredibly durable, waterproof bond that has withstood earthquakes, typhoons, and centuries of harsh weather.",
    category: "Fun Facts",
    dateString: "January 10, 2019",
    isStaffPick: true,
  },
  {
    title: "Renewable Energy Capacity Surpasses Forecasts Across Major Metros",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "The summer twilight in the far north stretches for hours, turning the water into liquid silver. New solar and wind arrays have expanded city grids faster than analysts projected, paving the way for cleaner municipal infrastructure.",
    category: "News",
    dateString: "January 5, 2019",
    isStaffPick: true,
  }
];

export function getBlogTime(doc) {
  if (!doc) return 0;
  if (doc.createdAt?.toDate) return doc.createdAt.toDate().getTime();
  if (doc.createdAt instanceof Date) return doc.createdAt.getTime();
  if (typeof doc.createdAt === "number") return doc.createdAt;
  if (typeof doc.createdAt === "string") {
    const t = new Date(doc.createdAt).getTime();
    if (!isNaN(t)) return t;
  }
  return 0;
}

export function combineBlogsConsistently(firestoreDocs = [], localCustom = []) {
  let deletedIds = new Set();
  try {
    const del = JSON.parse(localStorage.getItem("daily_news_deleted_ids") || "[]");
    deletedIds = new Set(del);
  } catch (e) {}

  const defaultWithIds = DEFAULT_POSTS.map((p, idx) => ({
    id: `post-${idx}`,
    ...p,
  }));

  // Clean firestore documents of any broken URLs and filter deleted
  const cleanFirestore = firestoreDocs
    .filter((doc) => !deletedIds.has(doc.id))
    .map((doc) => {
      let cleanImg = doc.imageUrl;
      if (!cleanImg || cleanImg.includes("photo-1477959858617-67f30bc75b82")) {
        cleanImg = heroCityStreetImg;
      }
      return {
        ...doc,
        imageUrl: cleanImg,
      };
    });

  const existingIds = new Set(cleanFirestore.map((d) => d.id));
  const uniqueLocal = localCustom
    .filter((c) => !existingIds.has(c.id) && !deletedIds.has(c.id));

  // Merge live user posts
  const liveList = [...uniqueLocal, ...cleanFirestore];
  liveList.sort((a, b) => getBlogTime(b) - getBlogTime(a));

  // Merge with default editorial stories
  const titlesSeen = new Set();
  const finalMerged = [];

  // Add live user and firestore docs first (newest at the top)
  for (const item of liveList) {
    const key = (item.title || "").toLowerCase().trim();
    if (key && !titlesSeen.has(key)) {
      titlesSeen.add(key);
      finalMerged.push(item);
    }
  }

  // Then add remaining default editorial stories that were not deleted
  for (const item of defaultWithIds) {
    if (deletedIds.has(item.id)) continue;
    const key = (item.title || "").toLowerCase().trim();
    if (key && !titlesSeen.has(key)) {
      titlesSeen.add(key);
      finalMerged.push(item);
    }
  }

  return finalMerged;
}

/**
 * Seeds Firestore with default sample blog posts if collection is empty
 */
export async function seedInitialBlogsIfEmpty() {
  try {
    const blogsRef = collection(db, "blogs");
    const snapshot = await getDocs(blogsRef);
    if (snapshot.empty) {
      console.log("Seeding initial blogs from Gutenverse theme...");
      for (const post of DEFAULT_POSTS) {
        await addDoc(blogsRef, {
          title: post.title,
          imageUrl: post.imageUrl,
          description: post.description,
          category: post.category || "News",
          dateString: post.dateString || "February 1, 2019",
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      }
      return true;
    }
    return false;
  } catch (err) {
    console.warn("Auto-seed skipped or permission pending:", err);
    return false;
  }
}
