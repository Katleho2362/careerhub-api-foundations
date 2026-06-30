export const NextResponse = {
  json: (data: unknown) => data,
  redirect: (url: string) => url,
  next: () => ({}),
};

export const NextRequest = class {};