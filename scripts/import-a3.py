#!/usr/bin/env python3
"""Import the official A3 (electric bicycle) theory bank.

Sources are the Ministry of Transport exports published on data.gov.il:
  Hebrew  : theoryexamhe_a3_data_yellow (RSS/XML)
  English : theoryexamhe_a3_data_yellow_en (XLSX)
  Arabic  : theoryexam_ar_a3_data_yellow (XLSX)
  French  : theoryexamhe_a3_data_yellow_fr (XLSX)
  Spanish : theoryexamhe_a3_data_yellow_sp (XLSX)

The A3 export contains 58 questions. Eighteen are image/sign questions that the
Ministry does not publish in all five languages; this importer keeps only the
40 questions that are complete and internally consistent across all languages.

Requires: Python 3.10+ and openpyxl (`pip install openpyxl`).
Usage: python scripts/import-a3.py
"""

from __future__ import annotations

import html
import json
import re
import urllib.request
from datetime import date
from pathlib import Path
from xml.etree import ElementTree as ET

import openpyxl

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / ".cache" / "a3"
BANK = ROOT / "data" / "bank" / "a3-01.json"
META = ROOT / "data" / "official-meta-a3.json"

SOURCES = {
    "he": (
        "https://data.gov.il/dataset/7fa2032a-eca9-48ba-a85b-cdd5a6bafbfa/"
        "resource/c99e857c-902d-4539-97b9-2df5c9d5f64c/download/theoryexamhe_a3_data_yellow.xlsx",
        "a3_he.xml",
    ),
    "en": (
        "https://data.gov.il/dataset/1afab4b5-f36e-4f96-b4e2-adca47d18d1b/"
        "resource/76d032de-222b-4c27-9bf6-5229d41ed379/download/theoryexamhe_a3_data_yellow_en.xlsx",
        "a3_en.xlsx",
    ),
    "ar": (
        "https://data.gov.il/dataset/68d9a6bf-3750-4f30-8154-0ffc60671e47/"
        "resource/5364b173-851a-4722-9c1f-563bbd919f48/download/theoryexam_ar_a3_data_yellow.xlsx",
        "a3_ar.xlsx",
    ),
    "fr": (
        "https://data.gov.il/dataset/53590f54-4efd-4a9b-8619-7e35d724dedd/"
        "resource/cbd353f3-94e4-41d6-9bbd-4c0751fa0a4b/download/theoryexamhe_a3_data_yellow_fr.xlsx",
        "a3_fr.xlsx",
    ),
    "es": (
        "https://data.gov.il/dataset/1ad4c703-ed78-4a30-b804-592ec94909bc/"
        "resource/b61c8402-a846-4943-8f08-7d45a36ce541/download/theoryexamhe_a3_data_yellow_sp.xlsx",
        "a3_es.xlsx",
    ),
}

TOPICS = {
    "laws": {1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16, 20, 23, 25, 31, 35, 41},
    "safety": {12, 15, 18, 21, 24, 32, 33, 34, 37, 38, 40, 43, 46, 47},
    "vehicle": {19, 22, 26, 28, 36, 39},
}

# The Ministry export has a few copy/paste defects. Repair only what is
# provably reconstructible from the parallel official languages.
REPAIRED_STEMS = {
    "en": {
        5: "Is a rider on an electric bicycle permitted to ride across a pedestrian crossing?",
    },
}
REPAIRED_OPTIONS = {
    "fr": {
        1: [
            "Non.",
            "Oui.",
            "Oui. À condition que le cycliste soit titulaire d’un permis de conduire.",
            "Oui. À condition qu’il soit équipé d’un moteur.",
        ],
        12: [
            "Les conducteurs de voitures jettent des mégots de cigarettes par la fenêtre, et ceux-ci pourraient le toucher.",
            "Il risque d’entrer en collision avec des piétons traversant la rue en dehors des passages désignés.",
            "Il n’y a plus de place en tête de colonne et à la ligne d’arrêt de l’intersection en raison du nombre élevé de véhicules deux-roues.",
            "Le cycliste n’est exposé à aucun danger. L’espace est toujours suffisant afin de permettre un passage sûr et aisé à un vélo électrique.",
        ],
    },
    "es": {
        22: [
            "10 km/h.",
            "40 km/h.",
            "25 km/h.",
            "25 km/h en zona urbana, 40 km/h en carretera abierta y 60 km/h en una vía con separación física.",
        ],
    },
}
REPAIRED_CORRECT = {
    ("fr", 12): 1,
    ("es", 22): 2,
}
REPAIRED_TEXT = {
    ("fr", 10): {1: "Oui."},
    ("fr", 35): {3: "Lorsque vous roulez en groupe de plus de dix personnes, un véhicule d’accompagnement est requis la nuit uniquement."},
    ("fr", 40): {3: "Les basses températures auxquelles le cycliste est exposé."},
}


def clean(value: str) -> str:
    value = re.sub(r"<[^>]+>", " ", value or "")
    value = html.unescape(value)
    return re.sub(r"\s+", " ", value).strip()


def parse_description(description: str) -> tuple[list[str], int]:
    options: list[str] = []
    correct = -1
    for item in re.findall(r"<li[^>]*>(.*?)</li>", description or "", re.S):
        span = re.search(r"<span([^>]*)>(.*?)</span>", item, re.S)
        attrs = span.group(1) if span else ""
        text = clean(span.group(2) if span else item)
        if not text:
            continue
        if "id=" in attrs:
            correct = len(options)
        options.append(text)
    return options, correct


def download(lang: str) -> Path:
    url, filename = SOURCES[lang]
    CACHE.mkdir(parents=True, exist_ok=True)
    target = CACHE / filename
    if target.exists() and target.stat().st_size > 1024:
        return target
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "Referer": "https://data.gov.il/",
        },
    )
    with urllib.request.urlopen(request, timeout=60) as response:
        target.write_bytes(response.read())
    return target


def parse_hebrew(path: Path) -> dict[int, dict]:
    root = ET.fromstring(path.read_text(encoding="utf-8-sig"))
    parsed: dict[int, dict] = {}
    for item in root.findall(".//item"):
        title = clean(item.findtext("title") or "")
        match = re.match(r"^(\d{1,5})\.\s*(.*)$", title, re.S)
        if not match:
            continue
        number = int(match.group(1))
        options, correct = parse_description(item.findtext("description") or "")
        parsed[number] = {"stem": match.group(2).strip(), "options": options, "correct": correct}
    return parsed


def parse_sheet(path: Path) -> dict[int, dict]:
    workbook = openpyxl.load_workbook(path, data_only=True)
    sheet = workbook.active
    parsed: dict[int, dict] = {}
    for row in sheet.iter_rows(min_row=2, values_only=True):
        title = clean(str(row[6] or ""))
        match = re.match(r"^(\d{1,5})\s*\.?\s*(.*)$", title, re.S)
        if not match:
            continue
        number = int(match.group(1))
        options, correct = parse_description(str(row[7] or ""))
        parsed[number] = {"stem": match.group(2).strip(), "options": options, "correct": correct}
    return parsed


def apply_repairs(lang: str, parsed: dict[int, dict]) -> dict[int, dict]:
    for number, stem in REPAIRED_STEMS.get(lang, {}).items():
        parsed[number]["stem"] = stem
    for number, options in REPAIRED_OPTIONS.get(lang, {}).items():
        parsed[number]["options"] = options
    for (repair_lang, number), correct in REPAIRED_CORRECT.items():
        if repair_lang == lang:
            parsed[number]["correct"] = correct
    for (repair_lang, number), replacements in REPAIRED_TEXT.items():
        if repair_lang != lang:
            continue
        for index, text in replacements.items():
            parsed[number]["options"][index] = text
    return parsed


def topic_for(number: int) -> str:
    for topic, numbers in TOPICS.items():
        if number in numbers:
            return topic
    return "safety"


def main() -> None:
    by_language: dict[str, dict[int, dict]] = {}
    for lang in SOURCES:
        source = download(lang)
        parsed = parse_hebrew(source) if lang == "he" else parse_sheet(source)
        by_language[lang] = apply_repairs(lang, parsed)
        print(f"{lang}: {len(parsed)} questions")

    common = set(by_language["he"])
    for lang in ("en", "ar", "fr", "es"):
        common &= set(by_language[lang])
    common = sorted(common)

    questions = []
    skipped = []
    for number in common:
        he = by_language["he"][number]
        if len(he["options"]) != 4 or he["correct"] < 0:
            skipped.append(number)
            continue

        translations = {}
        consistent = True
        for lang in ("he", "en", "ar", "fr", "es"):
            item = by_language[lang][number]
            if len(item["options"]) != 4 or item["correct"] < 0:
                consistent = False
                break
            translations[lang] = {
                "stem": item["stem"],
                "options": item["options"],
                "correctIndexes": [item["correct"]],
            }
        if not consistent:
            skipped.append(number)
            continue

        questions.append(
            {
                "id": f"a3-{number:04d}",
                "number": f"A3-{number:04d}",
                "categories": ["A3"],
                "topicId": topic_for(number),
                "type": "single",
                "difficulty": 2,
                "source": "official",
                "status": "published",
                "translations": translations,
            }
        )

    if len(questions) < 30:
        raise SystemExit(f"Not enough complete A3 questions: {len(questions)}")

    BANK.parent.mkdir(parents=True, exist_ok=True)
    BANK.write_text(json.dumps(questions, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")

    meta = {
        "source": "Israel Ministry of Transport and Road Safety — official A3 electric bicycle theory bank",
        "portal": "https://data.gov.il",
        "importedAt": date.today().isoformat(),
        "questionCount": len(questions),
        "languages": ["he", "en", "ar", "fr", "es"],
        "exam": {"questions": 30, "minutes": 40, "passThreshold": 26},
        "sourceUrls": {lang: SOURCES[lang][0] for lang in SOURCES},
        "skippedIncomplete": skipped,
    }
    META.write_text(json.dumps(meta, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(questions)} A3 questions to {BANK.relative_to(ROOT)}")
    print(f"Wrote metadata to {META.relative_to(ROOT)}")
    if skipped:
        print(f"Skipped incomplete questions: {skipped}")


if __name__ == "__main__":
    main()
