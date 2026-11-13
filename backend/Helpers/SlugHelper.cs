using System.Globalization;
using System.Text;
using System.Text.RegularExpressions;

namespace EcommerceAPI.Helpers;

public static class SlugHelper
{
    public static string GenerateSlug(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return string.Empty;

        // Convert to lowercase
        text = text.ToLowerInvariant();

        // Remove accents (é → e, ü → u)
        text = RemoveDiacritics(text);

        // Remove special characters except letters, numbers, spaces and hyphens
        text = Regex.Replace(text, @"[^a-z0-9\s-]", "");

        // Replace multiple spaces with single space
        text = Regex.Replace(text, @"\s+", " ").Trim();

        // Replace spaces with hyphens
        text = text.Replace(" ", "-");

        // Remove duplicate hyphens
        text = Regex.Replace(text, @"-+", "-");

        return text;
    }

    private static string RemoveDiacritics(string text)
    {
        var normalized = text.Normalize(NormalizationForm.FormD);

        var builder = new StringBuilder();

        foreach (var c in normalized)
        {
            if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
            {
                builder.Append(c);
            }
        }

        return builder.ToString().Normalize(NormalizationForm.FormC);
    }
}