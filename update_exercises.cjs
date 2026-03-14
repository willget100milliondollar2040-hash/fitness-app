const fs = require('fs');

const categories = [
  {
    category: "Ngực (Chest)",
    items: ["Push-up", "Diamond Push-up", "Wide Push-up", "Decline Push-up", "Incline Push-up", "Archer Push-up", "One Arm Push-up", "Spiderman Push-up", "Hindu Push-up", "Dive Bomber Push-up", "Clap Push-up", "Sphinx Push-up", "Pseudo Planche Push-up", "Bench Press", "Incline Bench Press", "Decline Bench Press", "Dumbbell Bench Press", "Incline Dumbbell Press", "Decline Dumbbell Press", "Dumbbell Fly", "Incline Dumbbell Fly", "Cable Crossover", "Low Cable Crossover", "High Cable Crossover", "Pec Deck Fly", "Machine Chest Press", "Svend Press", "Floor Press", "Guillotine Press", "Hex Press"]
  },
  {
    category: "Lưng (Back)",
    items: ["Pull-up", "Chin-up", "Wide Grip Pull-up", "Close Grip Pull-up", "Commando Pull-up", "Archer Pull-up", "Typewriter Pull-up", "One Arm Pull-up", "Australian Pull-up", "Deadlift", "Romanian Deadlift", "Sumo Deadlift", "Barbell Row", "Pendlay Row", "Dumbbell Row", "One Arm Dumbbell Row", "T-Bar Row", "Seated Cable Row", "Lat Pulldown", "Close Grip Lat Pulldown", "Reverse Grip Lat Pulldown", "Straight Arm Pulldown", "Face Pull", "Good Morning", "Hyperextension", "Superman", "Renegade Row", "Inverted Row", "Meadows Row", "Rack Pull"]
  },
  {
    category: "Vai (Shoulders)",
    items: ["Pike Push-up", "Elevated Pike Push-up", "Handstand Push-up (HSPU)", "Wall Handstand Push-up", "Overhead Press", "Seated Barbell Press", "Dumbbell Shoulder Press", "Arnold Press", "Push Press", "Lateral Raise", "Cable Lateral Raise", "Machine Lateral Raise", "Front Raise", "Dumbbell Front Raise", "Cable Front Raise", "Barbell Front Raise", "Reverse Pec Deck", "Bent Over Lateral Raise", "Cable Reverse Fly", "Upright Row", "Dumbbell Upright Row", "Cable Upright Row", "Shrugs", "Dumbbell Shrugs", "Barbell Shrugs", "Landmine Press", "Z Press", "Bradford Press", "Cuban Press", "Y-Raise"]
  },
  {
    category: "Tay trước (Biceps)",
    items: ["Barbell Curl", "Dumbbell Curl", "Hammer Curl", "Crossbody Hammer Curl", "Preacher Curl", "Machine Preacher Curl", "EZ Bar Curl", "Reverse Curl", "Zottman Curl", "Concentration Curl", "Cable Curl", "High Cable Curl", "Spider Curl", "Incline Dumbbell Curl", "Drag Curl", "Waiters Curl", "Bayesian Curl", "Pelican Curl", "Chin-up (Bicep Focus)", "Bodyweight Bicep Curl"]
  },
  {
    category: "Tay sau (Triceps)",
    items: ["Dips", "Straight Bar Dips", "Bench Dip", "Ring Dip", "Tricep Pushdown", "Rope Tricep Pushdown", "V-Bar Pushdown", "Straight Bar Pushdown", "Skull Crusher", "Dumbbell Skull Crusher", "EZ Bar Skull Crusher", "Overhead Tricep Extension", "Dumbbell Overhead Extension", "Cable Overhead Extension", "Tricep Kickback", "Cable Kickback", "Close Grip Bench Press", "JM Press", "Tate Press", "Bodyweight Tricep Extension", "Tiger Bend Push-up", "Sphinx Push-up"]
  },
  {
    category: "Chân (Legs)",
    items: ["Bodyweight Squat", "Jump Squat", "Pistol Squat", "Shrimp Squat", "Cossack Squat", "Bulgarian Split Squat", "Lunges", "Walking Lunges", "Jump Lunges", "Reverse Lunges", "Side Lunges", "Barbell Squat", "Front Squat", "Overhead Squat", "Zercher Squat", "Box Squat", "Hack Squat", "Leg Press", "Leg Extension", "Leg Curl", "Seated Leg Curl", "Lying Leg Curl", "Nordic Hamstring Curl", "Glute Bridge", "Barbell Glute Bridge", "Hip Thrust", "Barbell Hip Thrust", "Single Leg Hip Thrust", "Calf Raise", "Seated Calf Raise", "Donkey Calf Raise", "Tibialis Raise", "Step-ups", "Sissy Squat", "Wall Sit"]
  },
  {
    category: "Bụng/Lõi (Core)",
    items: ["Plank", "Side Plank", "Hollow Body Hold", "Arch Body Hold", "L-Sit", "V-Sit", "Manna", "Hanging Leg Raise", "Hanging Knee Raise", "Toes to Bar", "Dragon Flag", "Ab Wheel Rollout", "Crunch", "Bicycle Crunch", "Russian Twist", "Sit-up", "V-up", "Flutter Kicks", "Scissor Kicks", "Mountain Climber", "Cable Crunch", "Machine Crunch", "Woodchopper", "Pallof Press", "Dead Bug", "Bird Dog", "Captain's Chair Leg Raise", "Decline Crunch", "Reverse Crunch", "Tuck Planche Hold"]
  },
  {
    category: "Kỹ năng (Skills) & Toàn thân",
    items: ["Muscle-up", "Bar Muscle-up", "Ring Muscle-up", "Front Lever", "Back Lever", "Planche", "Straddle Planche", "Full Planche", "Human Flag", "Handstand", "One Arm Handstand", "Burpee", "Half Burpee", "Navy Seal Burpee", "Jumping Jack", "High Knees", "Butt Kicks", "Bear Crawl", "Crab Walk", "Inchworm", "Skaters", "Box Jump", "Kettlebell Swing", "Turkish Get-Up", "Snatch", "Clean and Jerk", "Power Clean", "Hang Clean", "Thruster", "Farmer's Walk"]
  }
];

function getLevel(name) {
  const advanced = ["One Arm", "Planche", "Front Lever", "Back Lever", "Human Flag", "Muscle-up", "Manna", "Dragon Flag", "Pistol Squat", "Shrimp Squat", "Handstand Push-up", "Guillotine Press", "Tiger Bend", "Typewriter", "Archer"];
  const intermediate = ["Commando", "Diamond", "Clap", "Dive Bomber", "Sphinx", "Pull-up", "Chin-up", "Dips", "Ring", "L-Sit", "V-Sit", "Toes to Bar", "Ab Wheel", "Bulgarian", "Cossack", "Barbell", "Dumbbell", "Cable", "Machine", "Deadlift", "Squat", "Bench Press", "Row", "Fly", "Curl", "Extension", "Pushdown", "Crusher", "Press", "Raise", "Shrugs", "Swing", "Get-Up", "Snatch", "Clean", "Jerk", "Thruster", "Walk", "Hollow Body", "Arch Body", "Tuck Planche", "Burpee", "Skaters", "Box Jump", "Woodchopper", "Pallof Press", "Captain's Chair"];
  
  for (let a of advanced) {
    if (name.includes(a)) return "Advanced";
  }
  for (let i of intermediate) {
    if (name.includes(i)) return "Intermediate";
  }
  return "Beginner";
}

function getMuscle(name, cat) {
  if (cat.includes("Ngực")) return "Chest";
  if (cat.includes("Lưng")) return "Back";
  if (cat.includes("Vai")) return "Shoulders";
  if (cat.includes("Tay trước")) return "Biceps";
  if (cat.includes("Tay sau")) return "Triceps";
  if (cat.includes("Chân")) return "Legs";
  if (cat.includes("Bụng")) return "Core";
  return "Full Body";
}

function getEquipment(name) {
  if (name.includes("Barbell") || name.includes("Bench Press") || name.includes("Deadlift") || name.includes("Squat") && !name.includes("Bodyweight") && !name.includes("Pistol") && !name.includes("Shrimp") && !name.includes("Cossack") && !name.includes("Bulgarian") && !name.includes("Jump") && !name.includes("Sissy")) return "Barbell";
  if (name.includes("Dumbbell")) return "Dumbbells";
  if (name.includes("Cable")) return "Cable Machine";
  if (name.includes("Machine") || name.includes("Pec Deck") || name.includes("Lat Pulldown") || name.includes("Leg Press") || name.includes("Leg Extension") || name.includes("Leg Curl")) return "Machine";
  if (name.includes("Ring")) return "Rings";
  if (name.includes("Kettlebell")) return "Kettlebell";
  if (name.includes("Band")) return "Resistance Band";
  if (name.includes("Pull-up") || name.includes("Chin-up") || name.includes("Muscle-up") || name.includes("Toes to Bar") || name.includes("Hanging")) return "Pull-up Bar";
  if (name.includes("Dips")) return "Dip Bar";
  if (name.includes("Ab Wheel")) return "Ab Wheel";
  return "Bodyweight";
}

const newCategories = categories.map(c => {
  return {
    category: c.category,
    items: c.items.map(name => {
      return {
        name,
        level: getLevel(name),
        muscle: getMuscle(name, c.category),
        equipment: getEquipment(name)
      };
    })
  };
});

let output = "";
for (let c of newCategories) {
  output += `  {\n    category: "${c.category}",\n    items: [\n`;
  for (let item of c.items) {
    output += `      { name: "${item.name}", level: "${item.level}", muscle: "${item.muscle}", equipment: "${item.equipment}" },\n`;
  }
  output += `    ]\n  },\n`;
}

const fileContent = fs.readFileSync('src/pages/ActiveWorkout.tsx', 'utf-8');
const startTag = '  {\n    category: "Ngực (Chest)",\n    items: ["Push-up"';
const endTag = '  }\n];';

const startIndex = fileContent.indexOf(startTag);
const endIndex = fileContent.indexOf(endTag) + endTag.length;

if (startIndex !== -1 && endIndex !== -1) {
  const newContent = fileContent.substring(0, startIndex) + output.trimEnd() + '\n];' + fileContent.substring(endIndex);
  fs.writeFileSync('src/pages/ActiveWorkout.tsx', newContent);
  console.log('Successfully updated ActiveWorkout.tsx');
} else {
  console.log('Could not find target content');
}
