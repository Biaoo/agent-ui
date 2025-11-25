export default function FontDemoPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose max-w-4xl mx-auto">
        <h1>Font Configuration Demo</h1>

        <p>
          This page demonstrates the font configuration of the project.
          We use a combination of Inter + Noto Sans SC to provide the best reading experience for mixed Chinese and English text.
        </p>

        <h2>Heading Levels</h2>

        <h1>Heading 1</h1>
        <h2>Heading 2</h2>
        <h3>Heading 3</h3>
        <h4>Heading 4</h4>

        <h2>Body Text</h2>

        <p>
          The body text uses Inter and Noto Sans SC fonts at 16px with a line height of 1.75 and letter spacing of 0.02em.
          This configuration provides a comfortable reading experience.
        </p>

        <p>
          <strong>Bold text uses font-weight: 600</strong>, providing moderate emphasis.
          <em>Italic text</em> is used for secondary emphasis.
        </p>

        <h2>Code Display</h2>

        <p>
          Inline code uses JetBrains Mono font: <code>const greeting = &quot;Hello World&quot;;</code>
        </p>

        <p>Code block example:</p>

        <pre><code>{`function fibonacci(n: number): number {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

// Call the function
const result = fibonacci(10);
console.log(\`The 10th Fibonacci number is: \${result}\`);`}</code></pre>

        <h2>Blockquote</h2>

        <blockquote>
          This is a quoted text. Blockquotes use italic style and left border to distinguish them.
        </blockquote>

        <h2>Lists</h2>

        <h3>Unordered List</h3>
        <ul>
          <li>Inter - English body font</li>
          <li>Noto Sans SC - Chinese body font</li>
          <li>JetBrains Mono - Code monospace font</li>
          <li>System fallback fonts ensure compatibility</li>
        </ul>

        <h3>Ordered List</h3>
        <ol>
          <li>Configure fonts in layout.tsx</li>
          <li>Define styles in globals.css</li>
          <li>Wrap Markdown content with .prose class</li>
          <li>Enjoy beautiful font display</li>
        </ol>

        <h2>Table</h2>

        <table>
          <thead>
            <tr>
              <th>Font Name</th>
              <th>Purpose</th>
              <th>Font Weight</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Inter</td>
              <td>English body</td>
              <td>400-700</td>
              <td>✅ Enabled</td>
            </tr>
            <tr>
              <td>Noto Sans SC</td>
              <td>Chinese body</td>
              <td>300-700</td>
              <td>✅ Enabled</td>
            </tr>
            <tr>
              <td>JetBrains Mono</td>
              <td>Code display</td>
              <td>400-700</td>
              <td>✅ Enabled</td>
            </tr>
            <tr>
              <td>Noto Serif SC</td>
              <td>Serif titles</td>
              <td>400-700</td>
              <td>✅ Optional</td>
            </tr>
          </tbody>
        </table>

        <h2>Links</h2>

        <p>
          Fonts have been optimized, see{" "}
          <a href="/FONT_GUIDE.md">Font Configuration Guide</a> for details.
          For more information, visit{" "}
          <a href="https://nextjs.org/docs/app/building-your-application/optimizing/fonts" target="_blank" rel="noopener noreferrer">
            Next.js Font Optimization Documentation
          </a>.
        </p>

        <h2>Mixed Text Test</h2>

        <p>
          The quick brown fox jumps over the lazy dog.
          0123456789 !@#$%^&*()_+-=[]{}|;&apos;:&quot;,./&lt;&gt;?
        </p>

        <p>
          This text contains English words, numbers (123456),
          and special symbols (!@#$%). The font system automatically selects the most appropriate font for each character to render.
        </p>

        <h2>Performance Features</h2>

        <ul>
          <li><strong>Font Subsetting</strong>: Only loads the character sets used</li>
          <li><strong>Preload Optimization</strong>: Critical fonts load first</li>
          <li><strong>Display Strategy</strong>: Uses swap to avoid invisible text</li>
          <li><strong>Fallback Fonts</strong>: Ensures fast first render</li>
          <li><strong>Dark Mode</strong>: Automatically adapts to system theme</li>
        </ul>
      </div>
    </div>
  );
}
