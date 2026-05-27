export const siteConfig = {
  fullName: "Dr. Maytham Altaan",
  email: "Maytham.m.altaan@gmail.com",
  phones: [
    { display: "+964 770 426 8175", intl: "+9647704268175", wa: "9647704268175" },
    { display: "+964 781 021 0038", intl: "+9647810210038", wa: "9647810210038" },
  ],
  social: {
    orcid: "https://orcid.org/0000-0003-4528-4716",
    facebook: "https://www.facebook.com/share/1Ceju6vxi4/?mibextid=wwXIfr",
    instagram:
      "https://www.instagram.com/dr.maytham.aljubori?igsh=Y3YxaHdzdmh1am1u&utm_source=qr",
    linkedin: "https://iq.linkedin.com/in/maytham-al-jubori-a06929154",
  },
  products: {
    aiDetector: "https://altaan-detector.vercel.app/",
  },
  apps: [
    {
      key: "cinemati",
      url: "https://apps.apple.com/us/app/%D8%B3%D9%8A%D9%86%D9%85%D8%A7%D8%A6%D9%8A-cinemati/id6762375503",
      platform: "iOS",
    },
    {
      key: "calorie",
      url: "https://apps.apple.com/us/app/%D8%AD%D8%A7%D8%B3%D8%A8%D8%A9-%D8%A7%D9%84%D8%B3%D8%B9%D8%B1%D8%A7%D8%AA-%D8%A7%D9%84%D8%B9%D8%B1%D8%A8%D9%8A%D8%A9/id6763806264",
      platform: "iOS",
    },
    {
      key: "residipok",
      url: "https://apps.apple.com/us/app/residipok/id6768218005",
      platform: "iOS",
    },
  ],
} as const;

export type AppEntry = (typeof siteConfig.apps)[number];
