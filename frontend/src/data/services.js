const services = [
  {
    id: 1,
    name: "Cleaning",
    description: "Professional home and office cleaning.",
    price: 1500,
    categories: [
      {
        id: 101,
        name: "House Cleaning",
        basePrice: 1500,
      },
      {
        id: 102,
        name: "Office Cleaning",
        basePrice: 2500,
      },
      {
        id: 103,
        name: "Carpet Cleaning",
        basePrice: 1200,
      },
      {
        id: 104,
        name: "Sofa Cleaning",
        basePrice: 1000,
      }
    ]
  },
  {
    id: 2,
    name: "Laundry",
    description: "Laundry and dry cleaning.",
    price: 800,
    categories: [
      {
        id: 201,
        name: "Washing",
        basePrice: 800,
      },
      {
        id: 202,
        name: "Ironing",
        basePrice: 500,
      },
      {
        id: 203,
        name: "Dry Cleaning",
        basePrice: 1000,
      }
    ]
  }
];

export default services;