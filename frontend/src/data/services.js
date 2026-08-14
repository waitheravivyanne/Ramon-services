const services = [

  {
    id: 1,
    name: "Cleaning",
    icon: "🧹",
    description:
      "Professional home, office and commercial cleaning services.",

    categories: [

      {
        id: 101,
        name: "House Cleaning",
        price: 1500,
        bookingType: "cleaning"
      },

      {
        id: 102,
        name: "Office Cleaning",
        price: 2500,
        bookingType: "cleaning"
      },

      {
        id: 103,
        name: "Window Cleaning",
        price: 1000,
        bookingType: "cleaning"
      },

      {
        id: 104,
        name: "Carpet Cleaning",
        price: 1500,
        bookingType: "cleaning"
      },

      {
        id: 105,
        name: "Sofa Cleaning",
        price: 1200,
        bookingType: "cleaning"
      }

    ]

  },


  {
    id: 2,
    name: "Laundry",
    icon: "👕",
    description:
      "Professional washing, drying and ironing services.",

    categories: [

      {
        id: 201,
        name: "Wash & Fold",
        price: 800,
        bookingType: "laundry"
      },

      {
        id: 202,
        name: "Ironing",
        price: 500,
        bookingType: "laundry"
      },

      {
        id: 203,
        name: "Dry Cleaning",
        price: 1000,
        bookingType: "laundry"
      }

    ]

  },


  {
    id: 3,
    name: "Plumbing",
    icon: "🔧",
    description:
      "Reliable plumbing installation and repair services.",

    categories: [

      {
        id: 301,
        name: "Leak Repair",
        price: 1000,
        bookingType: "plumbing"
      },

      {
        id: 302,
        name: "Blocked Drain",
        price: 1500,
        bookingType: "plumbing"
      },

      {
        id: 303,
        name: "Pipe Installation",
        price: 2500,
        bookingType: "plumbing"
      }

    ]

  },


  {
    id: 4,
    name: "Electrical",
    icon: "⚡",
    description:
      "Professional electrical installation and repair.",

    categories: [

      {
        id: 401,
        name: "Electrical Repair",
        price: 1500,
        bookingType: "electrical"
      },

      {
        id: 402,
        name: "Socket Installation",
        price: 1000,
        bookingType: "electrical"
      },

      {
        id: 403,
        name: "Lighting Installation",
        price: 1500,
        bookingType: "electrical"
      }

    ]

  },


  {
    id: 5,
    name: "Gardening",
    icon: "🌱",
    description:
      "Garden maintenance and landscaping services.",

    categories: [

      {
        id: 501,
        name: "Lawn Maintenance",
        price: 1000,
        bookingType: "gardening"
      },

      {
        id: 502,
        name: "Garden Cleaning",
        price: 1200,
        bookingType: "gardening"
      },

      {
        id: 503,
        name: "Landscaping",
        price: 3000,
        bookingType: "gardening"
      }

    ]

  },


  {
    id: 6,
    name: "Painting",
    icon: "🎨",
    description:
      "Interior and exterior painting services.",

    categories: [

      {
        id: 601,
        name: "Interior Painting",
        price: 3000,
        bookingType: "painting"
      },

      {
        id: 602,
        name: "Exterior Painting",
        price: 4000,
        bookingType: "painting"
      },

      {
        id: 603,
        name: "Room Painting",
        price: 2000,
        bookingType: "painting"
      }

    ]

  },


  {
    id: 7,
    name: "Moving",
    icon: "🚚",
    description:
      "Reliable home and office moving services.",

    categories: [

      {
        id: 701,
        name: "House Moving",
        price: 5000,
        bookingType: "moving"
      },

      {
        id: 702,
        name: "Office Moving",
        price: 7000,
        bookingType: "moving"
      },

      {
        id: 703,
        name: "Packing Service",
        price: 2500,
        bookingType: "moving"
      }

    ]

  }

];

export default services;