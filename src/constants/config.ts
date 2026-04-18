// src/constants/config.ts

export const CONFIG = {
  RSVP: {
    IS_OPEN: false,
  },

  PHOTOS: {
    // Download
    IS_READY: false,
    GALLERY_URL: "https://photos.app.goo.gl/YOUR_FUTURE_LINK_HERE",

    // Upload — kill-switch (set to false to force-lock regardless of date)
    IS_UPLOAD_READY: true,
    // Upload auto-opens on this date (one day before the wedding)
    UPLOAD_OPEN_ISO: "2026-06-25",
  },
  
  DATES: {
    RSVP_DEADLINE: "April 15th",
    // YYYY-MM-DD format for photo download logic
    WEDDING_DAY_ISO: "2026-06-26", 
  },

  BANK: {
    ACCOUNT_HOLDER: "A.M. Barrett & L.O. Wittrock",
    IBAN: "NL97 RABO 0330 5430 75",
    BIC: "RABONL2U",
  },

  // Google Maps links
  TRAVEL_LINKS: {
    VENUE: "https://www.google.com/maps/search/?api=1&query=Domaine+Des+Officiers+Vielsalm",
    TRAIN_STATION: "https://www.google.com/maps/search/?api=1&query=Gare+de+Vielsalm",
    PARKING_MAIN: "https://www.google.com/maps/dir//50.2852819,5.916406/@50.2853432,5.9161639,32m/data=!3m1!1e3!4m2!4m1!3e2!5m1!1e1?entry=ttu&g_ep=EgoyMDI1MTEzMC4wIKXMDSoASAFQAw%3D%3D",
    PARKING_CHURCH: "https://www.google.com/maps/@50.288295,5.9146925,87m/data=!3m1!1e3?entry=ttu&g_ep=EgoyMDI1MTExNy4wIKXMDSoASAFQAw%3D%3D",
  }
};