// Human-readable labels for Unihan database field codes.
// Extracted from the char page frontmatter so it can be unit-tested.

const UNIHAN_LABELS: Record<string, string> = {
  kDefinition: 'Definition',
  kMandarin: 'Mandarin',
  kCantonese: 'Cantonese',
  kHangul: 'Hangul',
  kKorean: 'Korean',
  kJapanese: 'Japanese',
  kJapaneseKun: 'Japanese Kun',
  kJapaneseOn: 'Japanese On',
  kVietnamese: 'Vietnamese',
  kHanyuPinyin: 'Hanyu Pinyin',
  kTang: 'Tang',
  kTotalStrokes: 'Total Strokes',
  kRSUnicode: 'Radical-Stroke (Unicode)',
  kRSKangXi: 'Radical-Stroke (KangXi)',
  kKangXi: 'KangXi',
  kCompatibilityVariant: 'Compatibility Variant',
  kIRG_KSource: 'IRG K Source',
  kIRG_GSource: 'IRG G Source',
  kIRG_JSource: 'IRG J Source',
  kIRG_TSource: 'IRG T Source',
  kIRG_USource: 'IRG U Source',
  kIRG_VSource: 'IRG V Source',
  kIRG_HSource: 'IRG H Source',
  kIRG_MSource: 'IRG M Source',
  kGradeLevel: 'Grade Level',
  kFrequency: 'Frequency',
  kHanYu: 'Han Yu',
  kPhonetic: 'Phonetic',
  kSemanticVariant: 'Semantic Variant',
  kSimplifiedVariant: 'Simplified Variant',
  kTraditionalVariant: 'Traditional Variant',
  kZVariant: 'Z Variant',
  kNelson: 'Nelson',
  kMorohashi: 'Morohashi',
  kCihaiT: 'Cihai T',
  kFenn: 'Fenn',
  kFourCornerCode: 'Four Corner Code',
};

export function unihanLabel(name: string): string {
  return UNIHAN_LABELS[name] ?? name.replace(/^k(.)/, (_, c: string) => c).replace(/([a-z])([A-Z])/g, '$1 $2');
}
