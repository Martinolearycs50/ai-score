const axiosMock = {
  create: jest.fn(() => ({
    get: jest
      .fn()
      .mockResolvedValue({ data: '<html><body>Test</body></html>', headers: {}, status: 200 }),
  })),
  get: jest
    .fn()
    .mockResolvedValue({ data: '<html><body>Test</body></html>', headers: {}, status: 200 }),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

export default axiosMock;
