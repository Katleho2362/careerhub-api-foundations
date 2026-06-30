import { http, HttpResponse } from "msw";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5234";

export const handlers = [
  http.post(`${API}/api/v1/jobs/:jobId/applications`, () => {
    return HttpResponse.json(
      {
        jobListingId: "22222222-0000-0000-0000-000000000001",
        applicantId: "33333333-0000-0000-0000-000000000099",
        submittedAt: new Date().toISOString(),
        status: "Submitted",
      },
      { status: 201 }
    );
  }),

  http.get(`${API}/api/v1/jobs`, () => {
    return HttpResponse.json({
      data: [],
      page: 1,
      pageSize: 10,
      totalCount: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }),
];