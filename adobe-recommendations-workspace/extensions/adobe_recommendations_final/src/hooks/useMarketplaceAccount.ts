import { useQuery, UseQueryResult } from "@tanstack/react-query";
// eslint-disable-next-line import/no-unresolved
import { request, gql } from "graphql-request";

const GET_ACCOUNT = gql`
  query {
    me {
      id
      firstName
      lastName
      email
      currentMembership {
        roles
        account {
          name
          id
        }
      }
    }
  }
`;

const fetch = async (): Promise<any> => {
  return request("/api/graphql", GET_ACCOUNT);
};

const useMarkeplaceAccount = (): UseQueryResult<unknown> =>
  useQuery([`account_me`], () => fetch(), { cacheTime: 0 });

export default useMarkeplaceAccount;
