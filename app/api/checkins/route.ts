import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { join } from "path";
import { prisma } from "@/lib/db";
import { generateCard } from "@/lib/image";

const createCheckInSchema = z.object({
  userId: z.string().min(1),
  // drinkId is optional if customDrinkName + (brandId/brandName) + (categoryId/categoryName) are provided
  drinkId: z.string().optional(),
  customDrinkName: z.string().optional(),
  brandId: z.string().optional(),
  brandName: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  // cityId or cityCode: at least one required
  cityId: z.string().optional(),
  cityCode: z.string().optional(),
  imageUrl: z.string().min(1),
  caption: z.string().optional(),
  aiSuggested: z.boolean().optional(),
  aiConfidence: z.number().min(0).max(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  locationName: z.string().optional(),
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = (await request.json()) as unknown;
    const parsed = createCheckInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: parsed.error.issues.map((i) => i.message).join(", "),
          },
        },
        { status: 400 }
      );
    }

    const {
      userId,
      drinkId,
      customDrinkName,
      brandId,
      brandName,
      categoryId,
      categoryName,
      cityId,
      cityCode,
      imageUrl,
      caption,
      aiSuggested,
      aiConfidence,
      lat,
      lng,
      locationName,
    } = parsed.data;

    // Resolve or create drink
    let finalDrinkId: string;
    let resolvedBrandName: string;
    let resolvedDrinkName: string;
    let finalCategoryId: string;

    if (drinkId) {
      // Use existing drink
      const drink = await prisma.drink.findUnique({
        where: { id: drinkId },
        include: { brand: true, category: true },
      });

      if (!drink) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Drink not found" } },
          { status: 404 }
        );
      }
      finalDrinkId = drink.id;
      resolvedBrandName = drink.brand.name;
      resolvedDrinkName = drink.name;
      finalCategoryId = drink.categoryId;
    } else if (customDrinkName && (brandId || brandName) && (categoryId || categoryName)) {
      // 1. Resolve category
      let category = null;
      if (categoryId) {
        category = await prisma.category.findUnique({ where: { id: categoryId } });
      }
      if (!category && categoryName) {
        category = await prisma.category.findFirst({
          where: {
            OR: [
              { name: categoryName },
              { label: categoryName },
            ],
          },
        });
      }
      // Fallback if not found
      if (!category) {
        category = await prisma.category.findFirst({
          where: { name: "other" },
        });
      }
      if (!category) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Category not resolved" } },
          { status: 500 }
        );
      }
      finalCategoryId = category.id;

      // 2. Resolve brand
      let brand = null;
      if (brandId) {
        brand = await prisma.brand.findUnique({ where: { id: brandId } });
      }
      if (!brand && brandName) {
        brand = await prisma.brand.upsert({
          where: { name: brandName },
          update: {},
          create: { name: brandName },
        });
      }
      if (!brand) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "Brand not resolved" } },
          { status: 500 }
        );
      }

      // 3. Resolve drink
      const drink = await prisma.drink.upsert({
        where: { brandId_name: { brandId: brand.id, name: customDrinkName } },
        update: {},
        create: { name: customDrinkName, brandId: brand.id, categoryId: finalCategoryId },
        include: { brand: true, category: true },
      });
      finalDrinkId = drink.id;
      resolvedBrandName = drink.brand.name;
      resolvedDrinkName = drink.name;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Either drinkId or (customDrinkName + brandId/brandName + categoryId/categoryName) is required",
          },
        },
        { status: 400 }
      );
    }


    // Resolve city
    let finalCityId: string;
    let cityName: string;

    if (cityId) {
      const city = await prisma.city.findUnique({ where: { id: cityId } });
      if (!city) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "City not found" } },
          { status: 404 }
        );
      }
      finalCityId = city.id;
      cityName = city.name;
    } else if (cityCode) {
      const city = await prisma.city.findUnique({ where: { code: cityCode } });
      if (!city) {
        return NextResponse.json(
          { success: false, error: { code: "NOT_FOUND", message: "City not found by code" } },
          { status: 404 }
        );
      }
      finalCityId = city.id;
      cityName = city.name;
    } else {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_REQUEST",
            message: "Either cityId or cityCode is required",
          },
        },
        { status: 400 }
      );
    }

    // Format today's date
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

    // Generate white-border card
    const imagePath = join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
    const cardUrl = await generateCard({
      imagePath,
      cityName,
      date: dateStr,
      brandName: resolvedBrandName,
      drinkName: resolvedDrinkName,
      caption,
    });

    // Create check-in record
    const checkIn = await prisma.checkIn.create({
      data: {
        userId,
        drinkId: finalDrinkId,
        cityId: finalCityId,
        imageUrl,
        cardUrl,
        categoryId: finalCategoryId,
        caption: caption ?? null,
        aiSuggested: aiSuggested ?? false,
        aiConfidence: aiConfidence ?? null,
        lat: lat ?? null,
        lng: lng ?? null,
        locationName: locationName ?? null,
        date: dateStr,
      },
      include: {
        drink: {
          include: {
            brand: true,
            category: true,
          },
        },
        city: true,
        _count: {
          select: { likes: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: checkIn,
    });
  } catch (error) {
    console.error("Failed to create check-in:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "CREATE_FAILED",
          message: "Failed to create check-in",
        },
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const dateFilter = url.searchParams.get("date"); // YYYY-MM optional
    const page = Math.max(1, parseInt(url.searchParams.get("page") ?? "1", 10));
    const limit = Math.max(
      1,
      Math.min(100, parseInt(url.searchParams.get("limit") ?? "20", 10))
    );

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "MISSING_USER_ID",
            message: "userId query parameter is required",
          },
        },
        { status: 400 }
      );
    }

    // Build where clause
    const where: Record<string, unknown> = { userId };

    if (dateFilter) {
      if (dateFilter.length === 7) {
        // YYYY-MM: filter by month
        where.date = {
          startsWith: dateFilter,
        };
      } else if (dateFilter.length === 10) {
        // YYYY-MM-DD: exact date match
        where.date = dateFilter;
      }
    }

    const [checkIns, total] = await Promise.all([
      prisma.checkIn.findMany({
        where,
        include: {
          drink: {
            include: {
              brand: true,
              category: true,
            },
          },
          city: true,
          _count: {
            select: { likes: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.checkIn.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: checkIns,
      meta: {
        total,
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("Failed to fetch check-ins:", error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: "FETCH_FAILED",
          message: "Failed to fetch check-ins",
        },
      },
      { status: 500 }
    );
  }
}
