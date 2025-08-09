import { db } from "../server/db";
import { blogCategories } from "../shared/schema";
import { sql } from "drizzle-orm";

async function addClinicalRotationCategory() {
  try {
    // Check if the category already exists
    const existingCategory = await db
      .select()
      .from(blogCategories)
      .where(sql`${blogCategories.name} = 'Clinical Rotation'`)
      .limit(1);

    if (existingCategory.length > 0) {
      console.log("Clinical Rotation category already exists");
      return;
    }

    // Add the Clinical Rotation category
    const [newCategory] = await db
      .insert(blogCategories)
      .values({
        name: "Clinical Rotation",
        slug: "clinical-rotation",
        description: "Articles about clinical rotations, observerships, and hands-on training for medical students and graduates",
        sortOrder: 1,
        isActive: true,
      })
      .returning();

    console.log("Successfully added Clinical Rotation category:", newCategory);

    // Also add other common medical categories if they don't exist
    const categoriesToAdd = [
      {
        name: "Medical Education",
        slug: "medical-education",
        description: "Articles about medical education, learning resources, and study tips",
        sortOrder: 2,
      },
      {
        name: "Career Advice",
        slug: "career-advice",
        description: "Career guidance for medical students and healthcare professionals",
        sortOrder: 3,
      },
      {
        name: "Clinical Skills",
        slug: "clinical-skills",
        description: "Tips and guides for developing clinical skills and competencies",
        sortOrder: 4,
      },
      {
        name: "Student Life",
        slug: "student-life",
        description: "Articles about medical student life, wellness, and work-life balance",
        sortOrder: 5,
      },
      {
        name: "Research",
        slug: "research",
        description: "Information about medical research opportunities and publications",
        sortOrder: 6,
      },
      {
        name: "Technology",
        slug: "technology",
        description: "Healthcare technology, digital health, and medical innovations",
        sortOrder: 7,
      },
    ];

    for (const category of categoriesToAdd) {
      const existing = await db
        .select()
        .from(blogCategories)
        .where(sql`${blogCategories.name} = ${category.name}`)
        .limit(1);

      if (existing.length === 0) {
        const [added] = await db
          .insert(blogCategories)
          .values({
            ...category,
            isActive: true,
          })
          .returning();
        console.log(`Added category: ${added.name}`);
      }
    }

    console.log("All categories added successfully!");
    process.exit(0);
  } catch (error) {
    console.error("Error adding categories:", error);
    process.exit(1);
  }
}

// Run the script
addClinicalRotationCategory();