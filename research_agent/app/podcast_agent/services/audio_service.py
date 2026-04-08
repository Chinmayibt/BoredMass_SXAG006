import subprocess
import os


def merge_audio(files, work_dir: str = "."):
    os.makedirs(work_dir, exist_ok=True)
    # Filter only existing files
    valid_files = [f for f in files if os.path.exists(f)]

    if not valid_files:
        raise ValueError("❌ No valid audio files found")

    inputs_name = "inputs.txt"
    inputs_path = os.path.join(work_dir, inputs_name)
    output_name = "podcast.mp3"
    output_path = os.path.join(work_dir, output_name)

    with open(inputs_path, "w", encoding="utf-8") as f:
        for file in valid_files:
            f.write(f"file '{os.path.abspath(file)}'\n")

    command = [
        "ffmpeg",
        "-f", "concat",
        "-safe", "0",
        "-i", inputs_name,
        "-c", "copy",
        output_name,
        "-y",
    ]

    result = subprocess.run(command, capture_output=True, text=True, cwd=work_dir)

    if result.returncode != 0:
        print("❌ FFmpeg Error:\n", result.stderr)
        raise RuntimeError("Audio merge failed")

    return output_path