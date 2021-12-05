import { Stack, Spinner, Heading } from "@chakra-ui/react";
import { UiNote, ViewNoteButton, DeleteButton } from "./shared-ui";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";

const ALL_NODES_QUERY = gql`
  query GetAllNotes($categoryId: String) {
    notes(categoryId: $categoryId) {
      id
      content
      category {
        id
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
    // [Notice] using "cache-and-network" is somehow expensive
    // for example, after a delete mutation call, even you use `update(cache, mutationResult)`
    // it will still make an extra fetch call to the backend
    //
    fetchPolicy: "cache-first",
    // by default when there is backend error
    // apollo will set data to undefined
    // if we don't want this behavior
    // we can set errorPolicy to "all"
    errorPolicy: "all",
  });

  const [deleteNote] = useMutation(
    gql`
      mutation DeleteNote($noteId: String!) {
        deleteNote(id: $noteId) {
          successful
          note {
            id
          }
        }
      }
    `,
    {
      // refetch the note list after delete
      // refetchQueries: ["GetAllNotes"],
      // or we can directly modify cache to avoid make an extra fetch call
      update: (cache, mutationResult) => {
        const deletedNoteId = cache.identify(
          mutationResult.data.deleteNote.note
        );
        cache.modify({
          fields: {
            notes: (existingNotes) => {
              return existingNotes.filter((noteRef) => {
                return cache.identify(noteRef) !== deletedNoteId;
              });
            },
          },
        });
      },
    }
  );

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
          <DeleteButton
            onClick={() =>
              deleteNote({
                variables: {
                  noteId: note.id,
                },
              })
            }
          />
        </UiNote>
      ))}
    </Stack>
  );
}
