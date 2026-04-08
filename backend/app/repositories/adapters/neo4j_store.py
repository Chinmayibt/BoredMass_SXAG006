from __future__ import annotations

from neo4j import GraphDatabase


class Neo4jGraphStore:
    def __init__(self, uri: str | None, user: str | None, password: str | None, database: str) -> None:
        self.database = database
        self._driver = None
        if uri and user and password:
            self._driver = GraphDatabase.driver(uri, auth=(user, password))

    def upsert_papers(self, papers: list[dict]) -> None:
        if not self._driver:
            return
        query = """
        UNWIND $papers AS p
        MERGE (n:Paper {id: p.id})
        SET n.title = p.title, n.year = p.year, n.source = p.source, n.url = p.url, n.citation_count = p.citation_count
        """
        with self._driver.session(database=self.database) as session:
            session.run(query, papers=papers)

    def upsert_edges(self, edges: list[dict]) -> None:
        if not self._driver:
            return
        query = """
        UNWIND $edges AS e
        MATCH (a:Paper {id: e.source}), (b:Paper {id: e.target})
        MERGE (a)-[r:RELATED {kind: e.kind}]->(b)
        SET r.weight = e.weight
        """
        with self._driver.session(database=self.database) as session:
            session.run(query, edges=edges)
