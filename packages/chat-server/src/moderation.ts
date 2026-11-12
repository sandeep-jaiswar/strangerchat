import {
  RegExpMatcher,
  TextCensor,
  englishDataset,
  englishRecommendedTransformers,
} from "obscenity";

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const censor = new TextCensor();

/** Masks severe profanity using the open-source obscenity matcher. */
export function moderateMessageText(input: string): {
  text: string;
  censored: boolean;
} {
  const matches = matcher.getAllMatches(input);
  if (matches.length === 0) return { text: input, censored: false };
  return {
    text: censor.applyTo(input, matches),
    censored: true,
  };
}
