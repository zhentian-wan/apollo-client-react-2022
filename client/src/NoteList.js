import { Stack, Spinner, Heading, Checkbox } from "@chakra-ui/react";
import {
  UiNote,
  ViewNoteButton,
  DeleteButton,
  UiLoadMoreButton,
} from "./shared-ui";
import { gql, useMutation, useQuery } from "@apollo/client";
import { Link } from "react-router-dom";
import { setNoteSelection } from ".";

// isSelected is client only state
// which doesn't need to be sent to the server
// interesting usage for @clinet
// you can mark all the fields as @client
// so that the state only stay in client, not being sent to backend
// so that you can slowly migrate backend to support it
const ALL_NODES_QUERY = gql`
  query GetAllNotes($categoryId: String, $offset: Int, $limit: Int) {
    notes(categoryId: $categoryId, offset: $offset, limit: $limit) {
      id
      content
      isSelected @client
      category {
        id
        label
      }
    }
  }
`;

const ALL_NODES_QUERY_REST = gql`
  query GetAllNotes($categoryId: String, $offset: Int, $limit: Int) {
    notes(categoryId: $categoryId, offset: $offset, limit: $limit)
      @rest(
        type: "Note"
        path: "/notes?categoryId={args.categoryId}&offset={args.offset}&limit={args.limit}"
      ) {
      id
      content
      isSelected @client
      category {
        id
        label
      }
    }
  }
`;

export function NoteList({ category }) {
  const { data, loading, error, fetchMore } = useQuery(ALL_NODES_QUERY, {
    variables: {
      categoryId: category,
      offset: 0,
      limit: 3,
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
  /**
   * `
      mutation DeleteNote($noteId: String!)
      @rest(
        type: "DeleteNoteResponse"
        method: "DELETE"
        path: "/notes?categoryId={args.categoryId}&offset={args.offset}&limit={args.limit}"
      ) {
        deleteNote(id: $noteId) {
          successful
          note @type(name: "Note"){
            id
          }
        }
      }
    `
   */
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
    // optimistic detel
    // if delete failed then apollo will restore item from cache
    {
      optimisticResponse: (vars) => {
        return {
          deleteNote: {
            successful: true,
            __typename: "DeleteNoteResponse",
            note: {
              id: vars.noteId,
              __typename: "Note",
            },
          },
        };
      },
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
        // if item was sucessfully deleted
        // we also want to remove the cache from master cache
        // it benefits other components update the state correctly
        cache.evict({ id: deletedNoteId });
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
          <Checkbox
            onChange={(e) => setNoteSelection(note.id, e.target.value)}
            isChecked={note.isSelected}
          >
            Select
          </Checkbox>
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
      <UiLoadMoreButton
        onClick={() => fetchMore({ variables: { offset: data.notes.length } })}
      />
    </Stack>
  );
}
