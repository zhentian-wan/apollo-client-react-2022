import { gql, useQuery, useMutation } from "@apollo/client";
import { useParams } from "react-router";
import { UiEditNote } from "./shared-ui";

const queryNote = gql`
  query GetNote($id: String!) {
    note(id: $id) {
      id
      content
    }
  }
`;

export function EditNote() {
  let { noteId } = useParams();
  const { data } = useQuery(queryNote, {
    variables: {
      id: noteId,
    },
  });
  // need to keep `id` in return data so that Apollo knows
  // how to update cache
  const [updateNote, { loading, error }] = useMutation(gql`
    mutation UpdateNote($id: String!, $content: String!) {
      updateNote(id: $id, content: $content) {
        successful
        note {
          id
          content
        }
      }
    }
  `);
  return (
    <UiEditNote
      isSaving={loading}
      onSave={(newContent) => {
        updateNote({
          variables: { id: noteId, content: newContent },
        });
      }}
      note={data?.note}
    />
  );
}
