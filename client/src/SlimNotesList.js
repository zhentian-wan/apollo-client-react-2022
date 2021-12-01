import { Stack } from "@chakra-ui/react";
import { UiNote } from "./shared-ui";
import { gql, useQuery } from "@apollo/client";

/**
 * For a subset of query, Apollo use cache instead of fetching from the server
 */

const ALL_NODES_QUERY = gql`
  query GetAllNotes {
    notes {
      id
      content
    }
  }
`;

export function SlimNoteList() {
  const { data } = useQuery(ALL_NODES_QUERY);
  const notes = data?.notes;
  return (
    <Stack spacing={4}>
      {notes?.map((note) => (
        <UiNote key={note.id} content={note.content}></UiNote>
      ))}
    </Stack>
  );
}
