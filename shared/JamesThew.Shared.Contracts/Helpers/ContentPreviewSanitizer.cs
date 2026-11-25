using System.Text.RegularExpressions;

namespace JamesThew.Shared.Contracts.Helpers;

/// <summary>
/// Sanitizes paid culinary recipes and tips into a safe 50% complimentary preview
/// for unauthenticated visitors without exposing full methodology or premium media URLs.
/// </summary>
public static partial class ContentPreviewSanitizer
{
    public static string TruncateDelimitedListToHalf(string? rawText, bool splitCommaWhenSingleLine = false)
    {
        if (string.IsNullOrWhiteSpace(rawText))
        {
            return string.Empty;
        }

        var lines = rawText
            .Split(["\r\n", "\r", "\n", "•"], StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
            .Where(line => line.Length > 0)
            .ToArray();

        if (lines.Length == 0)
        {
            return string.Empty;
        }

        if (splitCommaWhenSingleLine && lines.Length == 1 && lines[0].Contains(','))
        {
            var commaParts = OutsideParensCommaRegex()
                .Split(lines[0])
                .Select(part => part.Trim())
                .Where(part => part.Length > 0)
                .ToArray();

            if (commaParts.Length >= 2)
            {
                var halfCommaCount = Math.Max(1, (int)Math.Ceiling(commaParts.Length * 0.5));
                return string.Join(", ", commaParts.Take(halfCommaCount));
            }
        }

        if (lines.Length >= 2)
        {
            var halfLineCount = Math.Max(1, (int)Math.Ceiling(lines.Length * 0.5));
            return string.Join("\n", lines.Take(halfLineCount));
        }

        return TruncateTextToHalf(lines[0]);
    }

    public static string TruncateTextToHalf(string? rawText)
    {
        var text = (rawText ?? string.Empty).Trim();
        if (text.Length == 0)
        {
            return string.Empty;
        }

        var sentences = SentenceBoundaryRegex()
            .Split(text)
            .Select(sentence => sentence.Trim())
            .Where(sentence => sentence.Length > 0)
            .ToArray();

        if (sentences.Length >= 2)
        {
            var halfSentences = Math.Max(1, sentences.Length / 2);
            var visibleSentences = string.Join(" ", sentences.Take(halfSentences));
            var ratio = (double)visibleSentences.Length / text.Length;
            if (ratio is >= 0.2 and <= 0.75)
            {
                return visibleSentences;
            }
        }

        var words = WhitespaceRegex()
            .Split(text)
            .Where(word => word.Length > 0)
            .ToArray();

        if (words.Length < 2)
        {
            return text;
        }

        var targetCharIndex = (int)Math.Ceiling(text.Length * 0.5);
        var charCount = 0;
        var splitWordCount = 1;

        for (var i = 0; i < words.Length; i++)
        {
            charCount += words[i].Length + (i > 0 ? 1 : 0);
            splitWordCount = i + 1;
            if (charCount >= targetCharIndex)
            {
                break;
            }
        }

        if (splitWordCount >= words.Length)
        {
            splitWordCount = words.Length - 1;
        }

        return $"{string.Join(" ", words.Take(splitWordCount))}...";
    }

    [GeneratedRegex(@",(?![^(]*\))")]
    private static partial Regex OutsideParensCommaRegex();

    [GeneratedRegex(@"(?<=[.!?])\s+")]
    private static partial Regex SentenceBoundaryRegex();

    [GeneratedRegex(@"\s+")]
    private static partial Regex WhitespaceRegex();
}
