import { Stack, Spinner, Heading } from "@chakra-ui/react";
import { UiNote, ViewNoteButton } from "./shared-ui";
import { gql, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

const ALL_NODES_QUERY = gql`
  query GetAllNotes($categoryId: String) {
    notes(categoryId: $categoryId) {
      id
      content
      category {
        label
      }
    }
  }
`;

export function NoteList({ category }) {
  const { data, loading, error } = useQuery(ALL_NODES_QUERY, {
    variables: {
      categoryId: category,
    },
    // setup fetch policy to handle the cache
    // when to delete cache, when to fetch new data
    // "cache-and-network" will display cache first
    // and fetching new data from netowrk to update cache
    fetchPolicy: "cache-and-network",
    // by default when there is backend error
    // apollo will set data to undefined
    // if we don't want this behavior
    // we can set errorPolicy to "all"
    errorPolicy: "all",
  });

  if (loading && !data) {
    return <Spinner />;
  }

  if (error && !data) {
    return <Heading>Cannot fetch notes</Heading>;
  }

  const notes = data?.notes?.filter(Boolean);
  return (
    <Stack spacing={4}>
      {notes?.map((note) => (
        <UiNote
          key={note.id}
          content={note.content}
          category={note.category.label}
        >
          <Link to={`/note/${note.id}`}>
            <ViewNoteButton />
          </Link>
        </UiNote>
      ))}
    </Stack>
  );
}
