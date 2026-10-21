export interface PaginationMetadata {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
}

export const getPagination = (pageValue: unknown, limitValue: unknown) => {
  const requestedPage = typeof pageValue === "string" ? Number(pageValue) : NaN;
  const requestedLimit = typeof limitValue === "string" ? Number(limitValue) : NaN;

  const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
  const limit = Number.isInteger(requestedLimit) && requestedLimit > 0
    ? Math.min(requestedLimit, 100)
    : 10;

  return { page, limit, offset: (page - 1) * limit };
};

export const getPaginationMetadata = (
  page: number,
  limit: number,
  totalItems: number
): PaginationMetadata => ({
  page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});