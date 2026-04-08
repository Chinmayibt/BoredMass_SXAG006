from app.models.schemas import LoopLog


def generate_queries(topic: str, iteration: int) -> list[str]:
    topic = topic.strip()
    if iteration == 1:
        return [topic, f"{topic} survey", f"{topic} state of the art"]
    if iteration == 2:
        return [f"{topic} benchmark", f"{topic} challenges", f"{topic} applications"]
    return [f"{topic} limitations", f"{topic} future directions", f"{topic} comparative study"]


def should_stop(
    logs: list[LoopLog], collected_count: int, max_papers: int, novelty_threshold: float = 0.15
) -> tuple[bool, str | None]:
    if collected_count >= max_papers:
        return True, "paper_target_reached"
    if logs and logs[-1].novelty_ratio < novelty_threshold:
        return True, "low_novelty"
    return False, None
