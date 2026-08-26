const { prisma } = require('../config/prisma');
async function main() {
  const plans = await prisma.pricingPlan.findMany({ include: { features: { orderBy: { sortOrder: 'asc' } }, translations: true } });
  const comparisons = await prisma.pricingComparison.findMany({ include: { translations: true } });
  await prisma.$transaction(async (tx) => {
    for (const plan of plans) if (!plan.translations.some(({ locale }) => locale === 'vi')) await tx.pricingPlanTranslation.create({ data: { planId: plan.id, locale: 'vi', name: plan.name, priceLabel: plan.priceLabel, subtitle: Array.isArray(plan.subtitle) ? plan.subtitle : [], badge: plan.badge, buttonText: plan.buttonText, features: plan.features.map(({ content }) => content) } });
    for (const comparison of comparisons) if (!comparison.translations.some(({ locale }) => locale === 'vi')) await tx.pricingComparisonTranslation.create({ data: { comparisonId: comparison.id, locale: 'vi', title: comparison.title, values: comparison.values || '{}' } });
  });
  console.log(`Migrated ${plans.length} plans and ${comparisons.length} comparisons`);
}
main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(() => prisma.$disconnect());
