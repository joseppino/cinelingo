import { readable } from "svelte/store";

// create read-only svelte store
export const videoGroupStore = readable({
  films: [
    {
      groupId: 1,
      label: "Sci-Fi, Thought-provoking, Thrilling",
      examples: [
        {title: "Blade Runner", poster_path: "/63N9uy8nd9j7Eog2axPQ8lbr3Wj.jpg", tmdb_id: 78},
        {title: "2001: A Space Odyssey", poster_path: "/ve72VxNqjGM69Uky4WTo2bK6rfq.jpg", tmdb_id: 62},
        {title: "Planet of the Apes", poster_path: "/2r9iKnlSYEk4daQadsXfcjHfIjQ.jpg", tmdb_id: 871}
      ]
    },
    {
      groupId: 2,
      label: "Action, Anti-Hero, Intense",
      examples: [
        {title: "Terminator 2: Judgement Day", poster_path: "/5M0j0B18abtBI5gi2RhfjjurTqb.jpg", tmdb_id: 280},
        {title: "John Wick", poster_path: "/nCzzQKGijVzfGFg42id7uDLOjY5.jpg", tmdb_id: 245891},
        {title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", tmdb_id: 155}
      ]
    },
    {
      groupId: 3,
      label: "Gore, Horror, Psychological",
      examples: [
        {title: "Saw", poster_path: "/h2x0kRZWvwpw8GvghmQUn1m1jQo.jpg", tmdb_id: 176},
        {title: "The Silence of the Lambs", poster_path: "/uS9m8OBk1A8eM9I042bx8XXpqAq.jpg", tmdb_id: 274},
        {title: "The Exorcist", poster_path: "/4ucLGcXVVSVnsfkGtbLY4XAius8.jpg", tmdb_id: 9552}
      ]
    },
    {
      groupId: 4,
      label: "Chick Flick, Fun, Romantic",
      examples: [
        {title: "Bridget Jones' Diary", poster_path: "/dkauRl9TosBFikftrC3OVcKWDoz.jpg", tmdb_id: 634},
        {title: "Clueless", poster_path: "/8AwVTcgpTnmeOs4TdTWqcFDXEsA.jpg", tmdb_id: 9603},
        {title: "10 Things I Hate About You", poster_path: "/ujERk3aKABXU3NDXOAxEQYTHe9A.jpg", tmdb_id: 4951}
      ]
    },
    {
      groupId: 5,
      label: "Animated, Family, Comforting",
      examples: [
        {title: "Toy Story", poster_path: "/uXDfjJbdP4ijW5hWSBrPrlKpxab.jpg", tmdb_id: 862},
        {title: "Shrek", poster_path: "/iB64vpL3dIObOtMZgX3RqdVdQDc.jpg", tmdb_id: 808},
        {title: "WALL·E", poster_path: "/hbhFnRzzg6ZDmm8YAmxBnQpQIPh.jpg", tmdb_id: 10681}
      ]
    },
    {
      groupId: 6,
      label: "Fringe, Irreverent, Dark",
      examples: [
        {title: "Trainspotting", poster_path: "/bhY62Dw8iW54DIhxPQerbuB9DOP.jpg", tmdb_id: 627},
        {title: "Requiem for a Dream", poster_path: "/nOd6vjEmzCT0k4VYqsA2hwyi87C.jpg", tmdb_id: 641},
        {title: "Fight Club", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", tmdb_id: 550}
      ]
    }
  ],
  tv: [
    {
      groupId: 7,
      label: "Non-fiction, Informative, Investigative",
      examples: [
        {title: "Planet Earth", poster_path: "/mfXulHiALTloIqivuC4Q3lI3RGw.jpg", tmdb_id: 1044},
        {title: "Louis Theroux's Wierd Weekends", poster_path: "/9eLanPM4WpLUn00NTZMQQKzumzh.jpg", tmdb_id: 4050},
        {title: "Top Gear", poster_path: "/aqM6QnuhSXzjHlKbXyKUqxaGiWu.jpg", tmdb_id: 45}
      ]
    },
    {
      groupId: 8,
      label: "Cartoon, Animation, Family",
      examples: [
        {title: "The Simpsons", poster_path: "/zI3E2a3WYma5w8emI35mgq5Iurx.jpg", tmdb_id: 456},
        {title: "Family Guy", poster_path: "/aLB7psB9N81n5GecHNOudXWW3AI.jpg", tmdb_id: 1434},
        {title: "Adventure Time", poster_path: "/qk3eQ8jW4opJ48gFWYUXWaMT4l.jpg", tmdb_id: 15260}
      ]
    },
    {
      groupId: 9,
      label: "Drama, Romance, Teen",
      examples: [
        {title: "Sex Education", poster_path: "/8j12tohv1NBZNmpU93f47sAKBbw.jpg", tmdb_id: 81356},
        {title: "Riverdale", poster_path: "/kzZUa05wZOEiC2UVuJA2T8VrETU.jpg", tmdb_id: 69050},
        {title: "The Vampire Diaries", poster_path: "/xnow2L5YZTo36T4koZs24zU5oqa.jpg", tmdb_id: 18165}
      ]
    },
    {
      groupId: 10,
      label: "Crime, Action, Violent",
      examples: [
        {title: "Breaking Bad", poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg", tmdb_id: 1396},
        {title: "The Sopranos", poster_path: "/57okJJUBK0AaijxLh3RjNUaMvFI.jpg", tmdb_id: 1398},
        {title: "The Wire", poster_path: "/4lbclFySvugI51fwsyxBTOm4DqK.jpg", tmdb_id: 1438}
      ]
    },
    {
      groupId: 11,
      label: "Sitcom, Funny, Casual",
      examples: [
        {title: "Seinfeld", poster_path: "/aCw8ONfyz3AhngVQa1E2Ss4KSUQ.jpg", tmdb_id: 1400},
        {title: "Only Fools and Horses", poster_path: "/8QznQBwr4aqPIQTiymL7obM3qOK.jpg", tmdb_id: 72},
        {title: "Friends", poster_path: "/f496cm9enuEsZkSPzCwnTESEK5s.jpg", tmdb_id: 1668}
      ]
    },
    {
      groupId: 12,
      label: "Fantasy, Adventure, Sci-Fi",
      examples: [
        {title: "Star Trek", poster_path: "/bPsxOpHVpVCX3hFz2fxnF1Vz3Dj.jpg", tmdb_id: 253},
        {title: "Doctor Who", poster_path: "/sz4zF5z9zyFh8Z6g5IQPNq91cI7.jpg", tmdb_id: 57243},
        {title: "The Witcher", poster_path: "/7vjaCdMw15FEbXyLQTVa04URsPm.jpg", tmdb_id: 71912}
      ]
    }
  ]
});