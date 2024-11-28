import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";
import colors from "tailwindcss/colors";

export default <Partial<Config>>{
  theme: {
    extend: {
      colors: {
        primary: colors.emerald
      },
      fontFamily: {
        sans: ["Public Sans", ...defaultTheme.fontFamily.sans]
      }
    }
  }
};
