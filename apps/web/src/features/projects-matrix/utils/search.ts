import type { MatrixClientDto, ProjectsMatrixResponseDto } from '@optsolv/shared/schemas';

function normalize(value: string | null | undefined) {
  return value
    ?.normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
}

function matchesQuery(values: Array<string | null | undefined>, query: string) {
  return values.some((value) => normalize(value)?.includes(query));
}

export function filterProjectsMatrixBySearch(
  matrix: ProjectsMatrixResponseDto,
  search: string,
): ProjectsMatrixResponseDto {
  const query = normalize(search);
  if (!query) return matrix;

  const clients = matrix.clients.flatMap<MatrixClientDto>((client) => {
    if (matchesQuery([client.name, client.taxId], query)) return [client];

    const projects = client.projects.filter((project) =>
      matchesQuery([project.name, project.code, project.status], query),
    );

    if (projects.length === 0) return [];
    return [{ ...client, projects }];
  });

  return { ...matrix, clients };
}
