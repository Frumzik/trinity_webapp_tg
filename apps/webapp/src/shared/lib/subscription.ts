export const hasPaidSubscription = (user?: any): boolean => {
  const type = String(user?.subscription?.type || "").toLowerCase();

  const has = type === "pro" || type === "premium";

  console.log("[hasPaidSubscription] type =", type, "=>", has);
  return has;
};