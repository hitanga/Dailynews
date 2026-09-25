import { collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import heroCityStreetImg from "../assets/images/hero_city_street_1790345223275.jpg";

export const DEFAULT_POSTS = [
  {
    title: "At daybreak of the fifteenth day of my search",
    imageUrl: heroCityStreetImg,
    description: "When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay before me in the morning haze, the silent towers of stone and steel seemed to watch like ancient sentinels. The avenue was already beginning to stir with yellow cabs cutting through the cool morning air, their tires hissing on the damp asphalt.\n\nEvery corner in this city tells a layered story of migration, ambition, and quiet solitude. Stepping into the street, the sun broke through the narrow chasm between skyscrapers, casting long golden shadows along the crosswalk.",
    category: "Featured",
    dateString: "February 1, 2019",
    commentsCount: 4,
    isHero: true,
  },
  {
    title: "The sunset faded to twilight",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    description: "I began walking, therefore, in a big curve, seeking some point of vantage and continually looking around for the faint remnants of day. The deep blue cast settled over the rooftops as the streetlamps flickered to life one by one, signaling the beginning of the quiet hours in the creative quarter.\n\nPhotography in low light demands patience and a keen awareness of ambient light sources.",
    category: "Photo, Trending",
    dateString: "April 11, 2019",
    commentsCount: 2,
  },
  {
    title: "Then going through some small strange motions",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80",
    description: "A moderate incline runs towards the foot of Maybury Hill, and down this we clattered. Once the espresso machine hiss subsided, the rich crema formed a hazelnut swirl inside the porcelain rim.\n\nBaristas often speak of coffee preparation as an exacting ritual—water temperature, grind precision, and bar pressure all converging into a single harmonious pour.",
    category: "Food",
    dateString: "April 8, 2019",
    commentsCount: 5,
  },
  {
    title: "Two long weeks I wandered",
    imageUrl: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80",
    description: "Through two long weeks I wandered, stumbling through the nights guided only by the stars and highway lights ahead. The hum of the motorcycle engine became a rhythmic meditation across open lanes.\n\nTraveling solo on two wheels changes one's perception of distance and landscape.",
    category: "Lifestyle",
    dateString: "April 8, 2019",
    commentsCount: 1,
  },
  {
    title: "I shouted above the sudden noise.",
    imageUrl: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80",
    description: "I shouted above the sudden noise. She looked away from me downhill. The people were coming out towards the water's edge, gazing out at the misty fjord framed by jagged mountain peaks.\n\nThe crisp alpine air filled our lungs as the camera shutter clicked, capturing the fleeting golden glow over the tranquil lake.",
    category: "Featured, Lifestyle, Photo",
    dateString: "February 14, 2019",
    hasCameraBadge: true,
    commentsCount: 3,
  },
  {
    title: "At daybreak of the fifteenth day of my search",
    imageUrl: "https://images.unsplash.com/photo-1534430480872-3498386e7856?auto=format&fit=crop&w=800&q=80",
    description: "When the amphitheater had cleared I crept stealthily to the top and as the great excavation lay before me, morning traffic started to flow like an endless ribbon along the boulevard.\n\nThe architecture of urban canyons frames light in unexpected geometries, revealing textures in brick and glass that go unnoticed in the rush of everyday life.",
    category: "Featured",
    dateString: "February 1, 2019",
    commentsCount: 4,
  },
  {
    title: "The great excavation lay far from the plaza",
    imageUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
    description: "Far from the plaza and in an untenanted portion of the great dead city I had little trouble finding solitude. Street fashion photography captures the elegance of personal style against historical backdrops.\n\nMonochrome captures highlight textures in wool coats and architectural details that color might otherwise obscure.",
    category: "Photo",
    dateString: "January 16, 2019",
    commentsCount: 3,
  },
  {
    title: "Post with tall image – Your task is to watch the goats",
    imageUrl: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
    description: "High above the valley floor, the stark lines of modern concrete and glass meet the rugged mountain trails. Architectural minimalism challenges conventional ideas of living spaces.",
    category: "Travel",
    dateString: "January 10, 2019",
    isStaffPick: true,
  },
  {
    title: "Quiet reflections across the northern bay",
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80",
    description: "The summer twilight in the far north stretches for hours, turning the water into liquid silver. Writers and artists have long gathered here to find creative rejuvenation.",
    category: "Nature",
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
          category: post.category || "General",
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
