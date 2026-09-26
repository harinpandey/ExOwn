import { MOMENT_TEMPLATES } from "./quotes";
import { canShowMoment, selectRotatedTemplate } from "./frequency";
import { ActiveMoment, MomentCategory, MomentPriority } from "./types";

interface TriggerContext {
  userId?: string | null;
  campusName?: string;
  itemTitle?: string;
  itemPrice?: number;
  itemOldPrice?: number;
  itemImage?: string;
  itemHref?: string;
  categorySlug?: string;
  viewsCount?: number;
  amountDiff?: number;
  isTransactional?: boolean;
  priority?: MomentPriority;
  customCtaHref?: string;
}

const VIEW_TRACKER_PREFIX = "exown_pv_";

/**
 * Replaces message placeholders like {item}, {amount}, {campus}, etc. with real values.
 */
function interpolate(template: string, ctx: TriggerContext): string {
  let res = template;
  if (ctx.itemTitle) {
    res = res.replace(/\{item\}/g, ctx.itemTitle);
  } else {
    res = res.replace(/\{item\}/g, "listing");
  }

  if (ctx.amountDiff != null) {
    res = res.replace(/\{amount\}/g, `₹${ctx.amountDiff.toLocaleString("en-IN")}`);
  } else if (ctx.itemOldPrice && ctx.itemPrice) {
    const diff = Math.max(0, ctx.itemOldPrice - ctx.itemPrice);
    res = res.replace(/\{amount\}/g, `₹${diff.toLocaleString("en-IN")}`);
  } else {
    res = res.replace(/\{amount\}/g, "a great deal");
  }

  if (ctx.itemPrice != null) {
    res = res.replace(/\{price\}/g, ctx.itemPrice.toLocaleString("en-IN"));
  }

  if (ctx.campusName) {
    res = res.replace(/\{campus\}/g, ctx.campusName);
  } else {
    res = res.replace(/\{campus\}/g, "your campus");
  }

  if (ctx.viewsCount != null) {
    res = res.replace(/\{views\}/g, ctx.viewsCount.toString());
  } else {
    res = res.replace(/\{views\}/g, "multiple");
  }

  return res;
}

/**
 * Builds an ActiveMoment from a chosen template and context.
 */
export function buildActiveMoment(
  category: MomentCategory,
  ctx: TriggerContext = {},
  force = false
): ActiveMoment | null {
  const isTransactional = Boolean(ctx.isTransactional);
  const priority = ctx.priority || "normal";

  // Check frequency allowance unless forced
  if (!force && !canShowMoment(category, priority, isTransactional)) {
    return null;
  }

  // Find candidate templates
  const candidates = MOMENT_TEMPLATES.filter((t) => t.category === category);
  if (candidates.length === 0) return null;

  const chosen = selectRotatedTemplate(candidates);
  if (!chosen) return null;

  const title = interpolate(chosen.title, ctx);
  const message = interpolate(chosen.message, ctx);
  const cta = chosen.cta;
  const ctaHref = ctx.customCtaHref || ctx.itemHref || chosen.ctaHref || "/search";

  return {
    instanceId: `moment_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    templateId: chosen.id,
    category,
    title,
    message,
    cta,
    ctaHref,
    icon: chosen.icon || "Sparkles",
    image: ctx.itemImage,
    priority: ctx.priority || chosen.priority,
    isTransactional,
    timestamp: Date.now(),
    duration: priority === "urgent" ? 10000 : 7500,
    secondaryAction: chosen.secondaryAction ? { label: chosen.secondaryAction.label } : undefined,
  };
}

/**
 * Tracks product visits. When a user reaches 3 views on the same item,
 * triggers a REPEATED_VIEW moment.
 */
export function recordProductView(
  productId: string,
  title: string,
  price: number,
  image?: string,
  campusName?: string
): ActiveMoment | null {
  if (typeof window === "undefined" || !productId) return null;

  try {
    const key = `${VIEW_TRACKER_PREFIX}${productId}`;
    const raw = localStorage.getItem(key);
    let viewCount = 1;
    const now = Date.now();

    if (raw) {
      const data = JSON.parse(raw);
      // If within 48 hours, increment
      if (now - data.firstViewAt < 48 * 60 * 60 * 1000) {
        viewCount = (data.count || 0) + 1;
      }
    }

    localStorage.setItem(
      key,
      JSON.stringify({
        count: viewCount,
        lastViewAt: now,
        firstViewAt: raw ? JSON.parse(raw).firstViewAt || now : now,
      })
    );

    // If exactly 3 views, trigger the playful "Repeated View" moment!
    if (viewCount === 3) {
      return buildActiveMoment("REPEATED_VIEW", {
        itemTitle: title,
        itemPrice: price,
        itemImage: image,
        itemHref: `/product/${productId}`,
        campusName,
      });
    }
  } catch {
    // Ignore storage errors
  }

  return null;
}

/**
 * Trigger for when an item is added to Wishlist.
 */
export function onWishlistAdded(
  productId: string,
  title: string,
  image?: string
): ActiveMoment | null {
  return buildActiveMoment(
    "SAVED_ITEM",
    {
      itemTitle: title,
      itemImage: image,
      itemHref: `/product/${productId}`,
      customCtaHref: "/profile?tab=favorites",
    },
    true // show feedback immediately on user action
  );
}

/**
 * Trigger for detecting a price drop.
 */
export function onPriceDropDetected(
  productId: string,
  title: string,
  oldPrice: number,
  newPrice: number,
  image?: string
): ActiveMoment | null {
  const diff = Math.max(0, oldPrice - newPrice);
  if (diff <= 0) return null;

  return buildActiveMoment("PRICE_DROP", {
    itemTitle: title,
    itemPrice: newPrice,
    itemOldPrice: oldPrice,
    amountDiff: diff,
    itemImage: image,
    itemHref: `/product/${productId}`,
    priority: "high",
  });
}

/**
 * Contextual check for weekend or academic season triggers.
 */
export function checkTemporalMoment(campusName?: string): ActiveMoment | null {
  if (typeof window === "undefined") return null;

  const now = new Date();
  const day = now.getDay(); // 0 is Sunday, 6 is Saturday

  // Weekend sell reminder
  if (day === 0 || day === 6) {
    return buildActiveMoment("WEEKEND", {
      campusName,
      customCtaHref: "/sell",
      priority: "low",
    });
  }

  return null;
}
