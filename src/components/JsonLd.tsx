/**
 * Renders a JSON-LD structured-data script. "<" is escaped so DB/user-derived
 * strings can't break out of the <script> tag (</script> injection).
 */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD; "<" is escaped to prevent </script> breakout
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
