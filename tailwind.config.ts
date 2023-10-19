import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  plugins: [require("daisyui")],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#ffdaa8",
          "secondary": "#c955db",
          "accent": "#fc7ed4",
          "neutral": "#231f32",
          "base-100": "#f5f7fa",
          "info": "#3673dd",
          "success": "#6bebc9",
          "warning": "#9d8310",
          "error": "#e8174b",
          body: {
            "background-color": "#e3e6e6",
          }
        },
      },
    ],
  },
}
export default config
