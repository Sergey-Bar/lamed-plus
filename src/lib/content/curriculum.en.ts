import type { LocalizedLesson } from './curriculum'

export const EN_LESSONS: Record<string, LocalizedLesson> = {
  'laws-speed': {
    title: 'Speed, stopping distance and safe gaps',
    summary:
      'Why the speed limit is a ceiling rather than a target, and how to build a real safety gap.',
    blocks: [
      {
        heading: 'Speed is a decision, not a habit',
        body: 'The maximum speed on a sign or in law is the upper limit under ideal conditions. On a wet road, in the dark, in fog or when visibility is blocked, the safe speed is lower. Driving at the limit does not guarantee you can stop in time.',
      },
      {
        heading: 'The three distances worth knowing',
        body: 'Reaction distance is the distance travelled from the moment you spot a hazard until you press the brake. Braking distance is the distance the car travels from the moment you brake until it stops. Together they make up the stopping distance.',
        bullets: [
          'The higher the speed, the faster stopping distance grows.',
          'At double the speed, braking distance grows roughly fourfold.',
          'On a wet or slippery road, braking distance gets even longer.',
        ],
      },
      {
        heading: 'Keeping a gap in practice',
        body: 'The simple rule is at least a two-second gap from the vehicle ahead. In rain, in the dark or when the vehicle ahead is heavy, increase it. Pick a reference point at the roadside and count until the vehicle ahead passes it.',
      },
      {
        heading: 'How to drive at a safe speed',
        body: 'Look far ahead, spot hazards early and slow down before a bend, junction or crossing — not at the last moment. Keeping a steady, predictable speed also makes things easier for the people driving around you.',
      },
    ],
    keyPoints: [
      'The speed limit is a maximum, not a target.',
      'A gap of at least two seconds — more in difficult conditions.',
      'Slow down before a hazard, not after it.',
    ],
  },
  'laws-right-of-way': {
    title: 'Right of way and junctions',
    summary:
      'Who actually goes first at a junction, and how to avoid a situation where two drivers assume different things.',
    blocks: [
      {
        heading: 'Right of way is a rule, not a right',
        body: 'Right of way exists to prevent two drivers from deciding differently at the same moment. Even when you may go, you must approach the junction slowly, look both ways and be ready to stop.',
      },
      {
        heading: 'Who goes first at a junction?',
        body: 'A stop or give-way sign imposes its meaning. A turning vehicle must give way to pedestrians crossing the road it is entering. A vehicle entering a road must give way to those already on it.',
        bullets: [
          'At an unsigned junction: slow down, look and give way according to the rules of the road.',
          'Do not rely on “I have the right” — check that the other driver actually stops.',
          'A vehicle reversing must give way to all traffic.',
        ],
      },
      {
        heading: 'Pedestrians, bicycles and traffic lights',
        body: 'A green light does not guarantee the junction is clear. Before entering, make sure there are no pedestrians, cyclists or vehicles stuck inside. At a crossing, a pedestrian who has started to cross has right of way.',
      },
      {
        heading: 'When something is unclear',
        body: 'If you are unsure who goes first, slow down and give way. Yielding right of way is not a failure; it is the safe way to resolve uncertainty on the road.',
      },
    ],
    keyPoints: [
      'Slow down before every junction, even on a main road.',
      'A turning driver gives way to pedestrians and to anyone already in the junction.',
      'When in doubt, give way.',
    ],
  },
  'laws-signals': {
    title: 'Signals, lanes and overtaking',
    summary:
      'How to tell others what you intend to do, and how to overtake without surprising anyone.',
    blocks: [
      {
        heading: 'A signal is an early message',
        body: 'Signal before changing lane, turning or stopping, not while doing it. The signal must come early enough for another driver to react, and stop once the turn is complete.',
      },
      {
        heading: 'Using lanes correctly',
        body: 'Drive as far right as possible and leave the left lane for overtaking or turning. Change lanes only when the lane is clear, with a signal, a mirror check and a glance at the blind spot.',
      },
      {
        heading: 'Safe overtaking',
        body: 'Overtake only when visibility is good, the opposing lane is clear and the law allows it. Do not overtake before a crossing, at a junction, on a bend or when visibility is blocked. If you are not certain, do not overtake.',
        bullets: [
          'Before overtaking: check mirrors, signal and look at the road.',
          'During overtaking: keep a steady speed and a safe distance from the vehicle being passed.',
          'After overtaking: return to the lane only when the passed vehicle is visible in the mirror.',
        ],
      },
    ],
    keyPoints: [
      'Signal before, not during.',
      'Drive on the right and keep the left for overtaking.',
      'Overtaking is a decision of certainty, not patience.',
    ],
  },
  'signs-shapes': {
    title: 'How to read a sign before reading the words',
    summary:
      'Shape and colour tell you almost everything: warning, prohibition, obligation or information.',
    blocks: [
      {
        heading: 'A language of shapes and colours',
        body: 'A triangular sign with a red border is a warning sign: it prepares you for a nearby hazard. A red circle is a prohibition or restriction, and a blue circle is an instruction or obligation. A square or rectangular sign gives information or guidance.',
      },
      {
        heading: 'The exceptions',
        body: 'The stop sign has its own octagonal shape, and the give-way sign is an inverted triangle. The shape lets you recognise them even when the text is covered or visibility is poor.',
        bullets: [
          'A yellow background on a warning sign usually marks roadworks or a temporary situation.',
          'An information sign can direct you to a place, parking or a service.',
          'Road markings complement signs; they do not replace them.',
        ],
      },
      {
        heading: 'What to do when you see a sign',
        body: 'Recognise the shape, translate it into meaning and adjust your driving accordingly. A warning sign requires lower speed and readiness for changing road conditions; a prohibition sign is not a recommendation.',
      },
    ],
    keyPoints: [
      'Red triangle: warning. Red circle: prohibition. Blue circle: obligation.',
      'The shape of a sign is part of its meaning.',
      'A temporary yellow sign is still binding.',
    ],
  },
  'signs-warning': {
    title: 'Warning signs: the hazard before you see it',
    summary:
      'Bend, junction, crossing, children, slippery road or roadworks — what each sign asks you to do.',
    blocks: [
      {
        heading: 'A warning sign is not decoration',
        body: 'A warning sign announces a hazard you may not see yet. It requires you to adjust speed, increase your gap and look harder. If you carry on at the same speed, the sign has not done its job.',
      },
      {
        heading: 'Examples to recognise immediately',
        body: 'Sharp bend, junction, pedestrian crossing, children on the road, slippery road, dangerous gradient, roadworks and animals crossing. On a fast road a warning sign usually refers to the stretch just ahead, so do not wait until you can see the hazard itself.',
        bullets: [
          'Children near the road: slow down significantly and be ready to stop.',
          'Slippery road: reduce speed and avoid sharp turns and hard braking.',
          'Roadworks: follow the marked lane and keep your speed low.',
        ],
      },
      {
        heading: 'What happens if you miss a sign',
        body: 'If you notice a sign late, do not brake suddenly or make a sharp manoeuvre. Slow down gradually and continue carefully. Sudden braking can create a greater danger than the one the sign warns about.',
      },
    ],
    keyPoints: [
      'Warning = slow down and look, not just know.',
      'The hazard on a warning sign lies ahead of you.',
      'Missed a sign? Slow down gradually, not with a sharp brake.',
    ],
  },
  'signs-control': {
    title: 'Stop, give way and prohibitions',
    summary: 'The signs that require immediate action — and how they differ.',
    blocks: [
      {
        heading: 'Stop versus give way',
        body: 'At a stop sign you must come to a complete stop before the stop line or before the junction, even if the road looks clear. At a give-way sign there is no absolute duty to stop, but you must give way to those entitled to it — and stop if necessary.',
      },
      {
        heading: 'Prohibitions and restrictions',
        body: 'A red circle prohibits an action: entry, turning, overtaking, parking or exceeding the speed shown. The restriction applies where the sign is placed, until a sign cancels it or until the next junction if that is how it is set.',
      },
      {
        heading: 'Mandatory instructions',
        body: 'A blue sign sets what you must do: turn in a certain direction, drive in a certain lane or use a certain road. Plan your lane in advance rather than making a late turn.',
        bullets: [
          'A sign does not remove the need to look and drive according to conditions.',
          'A traffic light and a sign can operate together; respect both.',
          'If a sign is blocked or unclear, drive with extra care.',
        ],
      },
    ],
    keyPoints: [
      'Stop = complete stop. Give way = yield, and stop if needed.',
      'A red circle prohibits; a blue circle requires.',
      'Choose your lane before the junction.',
    ],
  },
  'safety-belts': {
    title: 'Seat belts, child seats and sitting correctly',
    summary:
      'What happens to the body in a sudden stop, and how to set up the seat so protection works.',
    blocks: [
      {
        heading: 'The belt is a system, not an accessory',
        body: 'In a sudden stop the body keeps moving forward. The belt spreads the force across the strong bones of the body and prevents impact with the interior or being thrown from the seat. It must be used on every trip, including in the back and on short journeys.',
      },
      {
        heading: 'Children — by law and by size',
        body: "Children who are not tall or old enough for a normal belt must use an appropriate child seat or booster, in accordance with the law. Do not move a child to the front seat before it is permitted, and always match the seat to the child's height and weight.",
        bullets: [
          'A child seat matched to age, weight and height — not age alone.',
          'An airbag does not replace a belt or a child seat.',
          "Secure the seat according to the manufacturer's instructions.",
        ],
      },
      {
        heading: 'A seating position that protects you',
        body: 'The headrest should support the head at eye or ear level, and your back should stay against the seat. Heavy objects that are not secured in the cabin can become projectiles in a sudden stop.',
      },
    ],
    keyPoints: [
      'A belt on every trip and for every passenger.',
      'A child seat by age, weight and height — not by convenience.',
      'A headrest and an adjusted seat reduce injury.',
    ],
  },
  'safety-weather': {
    title: 'Rain, fog and poor visibility',
    summary: 'Why the road changes when rain starts, and what to change in your driving.',
    blocks: [
      {
        heading: 'The moment rain starts is the most dangerous',
        body: 'At the start of rain, dust and oil on the road mix with water and form a slippery layer. Slow down before the road feels slippery, increase your gap and avoid sharp steering inputs.',
      },
      {
        heading: 'Driving in rain and through water',
        body: 'Water on the road can cause a loss of grip (aquaplaning). If it happens, do not brake suddenly or turn the wheel sharply; ease off the accelerator slightly, keep the wheel steady and let the tyres regain grip.',
        bullets: [
          'Use wipers and lights according to visibility.',
          'Increase your gap to at least two seconds — more in heavy rain.',
          'Avoid crossing puddles of unknown depth.',
        ],
      },
      {
        heading: 'Fog and low visibility',
        body: "In fog drive slowly, with appropriate lights, and look for edge lines or a fence to hold your lane. Do not be dazzled by another vehicle's high beams. If visibility is too low, stop in a safe place until conditions improve.",
      },
    ],
    keyPoints: [
      'Slow down when rain starts, not after you slide.',
      'Aquaplaning: less accelerator, steady wheel, no hard braking.',
      'In low visibility — slow down, turn on lights, and stop if needed.',
    ],
  },
  'safety-fatigue': {
    title: 'Fatigue, distraction and safe driving',
    summary: 'The biggest danger is not always the road — sometimes it is inside the car.',
    blocks: [
      {
        heading: 'Fatigue impairs you even without falling asleep',
        body: 'Fatigue slows reaction time and harms your ability to judge distances. Yawning, heavy eyes, missing exits and difficulty holding a lane are warning signs. A short stop for coffee does not replace sleep.',
      },
      {
        heading: 'Distraction',
        body: 'A message, navigation, food or an intense conversation takes your eyes and mind off the road. Before setting off, set the navigation, silence alerts and tidy the car. Driving demands full attention.',
        bullets: [
          'Do not write or read messages while driving.',
          'Passengers can help with navigation and alerts.',
          'Noisy or distracting passengers — ask for a moment of quiet.',
        ],
      },
      {
        heading: 'Planning prevents fatigue',
        body: "Set off after enough sleep, plan breaks on long journeys and avoid driving at hours when your body expects sleep. If you are tired, stop in a safe place; do not carry on for 'just a little longer'.",
      },
    ],
    keyPoints: [
      'Fatigue affects reactions before you feel dizzy.',
      'Switch off screens and alerts before you set off.',
      'A break in a safe place beats continuing while tired.',
    ],
  },
  'vehicle-tires': {
    title: 'Tyres: your only grip on the road',
    summary: 'Air pressure, tread depth and uneven wear — what to check and when.',
    blocks: [
      {
        heading: 'Correct air pressure',
        body: "Air pressure is set by the manufacturer's instructions, not by how the tyre looks. Check it when the tyres are cold, before a long journey or at least once a month. Low pressure increases braking distance, fuel consumption and sidewall wear.",
      },
      {
        heading: 'Tread depth and wear',
        body: 'Shallow tread reduces water clearance and increases the risk of aquaplaning. Uneven wear, bulges, cracks or an object stuck in the tyre require a professional inspection. The spare tyre must also be sound and inflated.',
        bullets: [
          'Check both sides and the sidewall of every tyre.',
          'Wear on one side usually indicates an alignment or pressure problem.',
          'Replace tyres according to the manufacturer and the law, not only when they are completely worn.',
        ],
      },
      {
        heading: 'Seasonal tyres',
        body: 'In harsh winter conditions, match the tyres to the road conditions. A summer tyre does not replace a winter tyre when the road is wet or especially cold.',
      },
    ],
    keyPoints: [
      'Check pressure when the tyre is cold, per the manufacturer.',
      'Shallow tread = less water clearance and more sliding.',
      'Uneven wear is a sign to get a check.',
    ],
  },
  'vehicle-lights': {
    title: 'Lights, brakes and the dashboard',
    summary: 'How to spot a fault before it becomes a breakdown on the road.',
    blocks: [
      {
        heading: 'Visibility is safety',
        body: 'Front lights, rear lights, brake lights and indicators are how you communicate with other drivers. Check them before a journey, especially after the car has been standing or after a repair. A blown bulb is a safety fault.',
      },
      {
        heading: 'Brakes: what you feel',
        body: 'A soft brake pedal, vibration, persistent squealing or pulling to one side while braking are signs to get a check. Do not ignore them. ABS is designed to prevent wheel lock-up, but it does not shorten braking distance in every condition.',
        bullets: [
          'A red brake warning light on — stop safely and get a check.',
          'A flashing engine light — avoid load and check it soon.',
          'If the brake feels different, do not carry on driving as normal.',
        ],
      },
      {
        heading: 'A short check routine',
        body: 'Before a journey: lights, tyres, mirrors, washer fluid and belt. After a journey: safe parking, handbrake, closing windows and checking the car. A short routine prevents surprises.',
      },
    ],
    keyPoints: [
      'Working lights are communication with the rest of the road.',
      'A change in brake feel requires a check.',
      'A short pre-drive check prevents faults.',
    ],
  },
  'vehicle-load': {
    title: 'Load, cargo and boots',
    summary:
      'How an unsecured load becomes a hazard — and what not to forget before setting off.',
    blocks: [
      {
        heading: 'Cargo must stay put',
        body: 'In a sudden stop an unsecured load keeps moving. Secure heavy cargo in the boot or with straps and nets, and keep heavy items low and as close to the centre of the car as possible.',
      },
      {
        heading: 'Weight limits',
        body: "Every vehicle has a total weight limit and an axle load limit. Overloading changes the vehicle's behaviour, lengthens braking distance and increases tyre wear. Do not exceed the limit even if the car 'copes'.",
        bullets: [
          'High cargo can shift the centre of gravity and increase the risk of rollover.',
          'Roof cargo increases fuel consumption and sensitivity to wind.',
          'Make sure cargo does not obstruct visibility or lighting.',
        ],
      },
      {
        heading: 'Before you set off',
        body: 'Check that the load is secured, the doors and windows are closed, nothing covers the number plate or a light, and the tyres suit the load. Drive at an appropriate speed and take bends carefully.',
      },
    ],
    keyPoints: [
      'An unsecured load is a hazard even on a short trip.',
      "Do not exceed the vehicle's weight limits.",
      'Load low, secured and without blocking visibility.',
    ],
  },
}

export const EN_SUBJECTS: Record<string, string> = {
  laws: 'Traffic rules, speed, right of way and signals — the basis for every decision on the road.',
  signs: 'Signs and road markings: shape, colour and meaning, without rote memorisation.',
  safety: 'Safety in practice: belts, weather, fatigue and distraction.',
  vehicle: 'Knowing your vehicle: tyres, brakes, lights and load — what to check and why.',
}
