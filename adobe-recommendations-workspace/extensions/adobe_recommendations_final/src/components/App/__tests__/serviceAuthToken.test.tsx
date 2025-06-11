import fetchMock from "jest-fetch-mock";
import serviceAuthToken from "../../../functions/serviceAuthToken";

const MOCK_TOKEN = "mock_token";
const API_DATA = "some_api_data";
const MOCK_URL = "/api/auth/v1/sessions/userinfo";
const MOCK_FETCH_OPTIONS = {
  method: "GET",
  credentials: "include",
  headers: {
    "Content-Type": "application/json",
  },
};

const MOCK_RESPONSE = JSON.stringify({
  data: {
    userExternalServiceAuthenticationToken: {
      token: MOCK_TOKEN,
    },
  },
});

describe("Service Authentication Token", () => {
  beforeEach(() => {
    fetchMock.resetMocks();
    serviceAuthToken.reset();
  });
  fetchMock.enableMocks();

  it("getServiceAuthToken returns token", async () => {
    fetchMock.mockResponseOnce(MOCK_RESPONSE);
    const { token } = await serviceAuthToken.getServiceAuthToken();
    expect(token).toEqual(MOCK_TOKEN);
  });

  it("getServiceAuthToken returns error message when token invalidation timer > 3min", async () => {
    fetchMock.mockResponseOnce(MOCK_RESPONSE);
    const { token, errorMessage } = await serviceAuthToken.getServiceAuthToken(
      200000
    );
    expect(token).toEqual(undefined);
    expect(errorMessage).toBe(
      "Authentication Token Error: Token invalidation timer must be between 0s and 3min."
    );
  });

  it("fetchExternalData returns API data", async () => {
    fetchMock.once(MOCK_RESPONSE).once(
      JSON.stringify({
        data: API_DATA,
      })
    );

    const { response } = await serviceAuthToken.fetchExternalData(
      MOCK_URL,
      MOCK_FETCH_OPTIONS,
      5000
    );
    expect(fetchMock.mock.calls.length).toEqual(2);
    expect(fetchMock.mock.calls[1][0]).toBe(MOCK_URL);
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual({
      "Content-Type": "application/json",
      "MP-Authorization": MOCK_TOKEN,
    });

    expect(response).toEqual({
      data: API_DATA,
    });
  });

  it("fetchExternalData will not call any API when token invalidation timer > 3min", async () => {
    fetchMock.once(MOCK_RESPONSE);

    const { errorMessage } = await serviceAuthToken.fetchExternalData(
      MOCK_URL,
      MOCK_FETCH_OPTIONS,
      200000
    );
    expect(fetchMock.mock.calls.length).toEqual(0);
    expect(errorMessage).toBe(
      "Authentication Token Error: Token invalidation timer must be between 0s and 3min."
    );
  });

  it("fetchExternalData returns error message when token cannot be retrieved", async () => {
    const { status, response, errorMessage } =
      await serviceAuthToken.fetchExternalData(
        MOCK_URL,
        MOCK_FETCH_OPTIONS,
        5000
      );
    expect(errorMessage).toBe(
      "Authentication Token Error: FetchError: invalid json response body at  reason: Unexpected end of JSON input"
    );
    expect(response).toBeUndefined();
    expect(status).toBeUndefined();
  });

  it("fetchExternalData returns no response when secure token cannot be obtained", async () => {
    fetchMock.once(MOCK_RESPONSE);

    const { status, response, errorMessage } =
      await serviceAuthToken.fetchExternalData(
        MOCK_URL,
        MOCK_FETCH_OPTIONS,
        5000
      );
    expect(fetchMock.mock.calls.length).toEqual(2);
    expect(fetchMock.mock.calls[1][0]).toBe(MOCK_URL);
    expect(fetchMock.mock.calls[1][1]?.headers).toEqual({
      "Content-Type": "application/json",
      "MP-Authorization": MOCK_TOKEN,
    });

    expect(response).toBeUndefined();
    expect(status).toBeUndefined();
    expect(errorMessage).toBe(
      "External API call Error: FetchError: invalid json response body at  reason: Unexpected end of JSON input"
    );
  });

  it("getServiceAuthToken returns cached token when called multiple times", async () => {
    fetchMock.mockResponseOnce(MOCK_RESPONSE);

    await serviceAuthToken.getServiceAuthToken();
    const { token } = await serviceAuthToken.getServiceAuthToken();
    expect(token).toEqual(MOCK_TOKEN);
  });

  it("getServiceAuthToken returns status error", async () => {
    fetchMock.mockResponseOnce(MOCK_RESPONSE, {
      status: 500,
      statusText: "This is a mock error",
    });

    const { status, errorMessage } =
      await serviceAuthToken.getServiceAuthToken();
    expect(status).toBe(500);
    expect(errorMessage).toBe(
      "Authentication Token Error: This is a mock error"
    );
  });
});
