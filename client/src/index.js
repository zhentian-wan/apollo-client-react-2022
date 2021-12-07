import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  HttpLink,
  from,
  makeVar,
} from "@apollo/client";
import { RetryLink } from "@apollo/client/link/retry";
import { RestLink } from "apollo-link-rest";

// makeVar let apollo know the variable value changes
let selectedNoteIds = makeVar(["2"]);
// selectedNoteId() read the value
// selectedNoteId(["3"]) set the value
export function setNoteSelection(noteId, isSelected) {
  if (isSelected) {
    selectedNoteIds([...selectedNoteIds(), noteId]);
  } else {
    selectedNoteIds(selectedNoteIds().filter((sId) => sId !== noteId));
  }
}

const restLink = new RestLink({
  uri: "http://localhost:4000/rests-api",
});
const httpLink = new HttpLink({
  uri: "http://localhost:4000/graphql",
});
const retryLink = new RetryLink({
  delay: {
    initial: 2000,
    max: 2000,
    // jitter controls whether randomize the interval of retry
    // set it to true can aovid all the retry requests hit to
    // the server at the same time
    jitter: false,
  },
});
const client = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          notes: {
            keyArgs: ["categoryId"],
            merge: (existingNotes = [], incomingNotes) => {
              // by default incoming data will replace the existing data
              return [...existingNotes, ...incomingNotes];
            },
          },
          // cache redirect policy
          // since when we load NoteList, all the View Note data is already in cache
          // if we don't want Apollo try to fetch data again, we can directly get data
          // from the cache
          note: {
            read: (crtValue, helpers) => {
              const queriedNoteId = helpers.args.id;
              return helpers.toReference({
                __typename: "Note",
                id: queriedNoteId,
              });
            },
          },
        },
      },
      // define a new type called Note
      Note: {
        fields: {
          isSelected: {
            // everytime read it just return true
            read: (crtValue, helpers) => {
              return selectedNoteIds().includes(helpers.readField("id"));
            },
          },
        },
      },
    },
  }),
  // from method combine multi links into single link
  link: from([retryLink, restLink, httpLink]),
});

ReactDOM.render(
  <React.StrictMode>
    <ChakraProvider>
      <ApolloProvider client={client}>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </ApolloProvider>
    </ChakraProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
