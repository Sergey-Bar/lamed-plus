import type { LocalizedLesson } from './curriculum'

export const FR_LESSONS: Record<string, LocalizedLesson> = {
  'laws-speed': {
    title: 'Vitesse, distance d’arrêt et marges de sécurité',
    summary:
      'Pourquoi la limitation est un plafond et non un objectif, et comment construire une vraie marge de sécurité.',
    blocks: [
      {
        heading: 'La vitesse est une décision, pas une habitude',
        body: 'La vitesse maximale indiquée par un panneau ou la loi est la limite supérieure dans des conditions idéales. Sur route mouillée, de nuit, dans le brouillard ou lorsque la visibilité est masquée, la vitesse sûre est plus basse. Rouler à la limite ne garantit pas de pouvoir s’arrêter à temps.',
      },
      {
        heading: 'Les trois distances à connaître',
        body: 'La distance de réaction est le trajet parcouru entre le moment où vous repérez un danger et celui où vous freinez. La distance de freinage est le trajet de la voiture entre le début du freinage et l’arrêt. Ensemble, elles forment la distance d’arrêt.',
        bullets: [
          'Plus la vitesse est élevée, plus la distance d’arrêt augmente vite.',
          'À vitesse doublée, la distance de freinage est multipliée par environ quatre.',
          'Sur route mouillée ou glissante, la distance de freinage s’allonge encore.',
        ],
      },
      {
        heading: 'Garder une marge en pratique',
        body: 'La règle simple est une marge d’au moins deux secondes avec le véhicule qui précède. Sous la pluie, de nuit ou si le véhicule devant est lourd, augmentez-la. Choisissez un repère au bord de la route et comptez jusqu’à ce que le véhicule devant le dépasse.',
      },
      {
        heading: 'Comment rouler à une vitesse sûre',
        body: 'Regardez loin devant, repérez les dangers tôt et ralentissez avant un virage, un carrefour ou un passage — pas au dernier moment. Une vitesse régulière et prévisible facilite aussi la conduite des autres.',
      },
    ],
    keyPoints: [
      'La limitation est un maximum, pas un objectif.',
      'Une marge d’au moins deux secondes — davantage dans des conditions difficiles.',
      'Ralentissez avant le danger, pas après.',
    ],
  },
  'laws-right-of-way': {
    title: 'Priorité et carrefours',
    summary:
      'Qui passe vraiment en premier à un carrefour, et comment éviter que deux conducteurs supposent des choses différentes.',
    blocks: [
      {
        heading: 'La priorité est une règle, pas un droit',
        body: 'La priorité existe pour éviter que deux conducteurs décident différemment au même instant. Même lorsque vous pouvez passer, vous devez approcher le carrefour lentement, regarder des deux côtés et être prêt à vous arrêter.',
      },
      {
        heading: 'Qui passe en premier ?',
        body: 'Un panneau stop ou cédez-le-passage impose son sens. Un véhicule qui tourne doit céder le passage aux piétons qui traversent la route où il entre. Un véhicule qui entre sur une route doit céder le passage à ceux qui y circulent déjà.',
        bullets: [
          'À un carrefour sans panneau : ralentir, regarder et céder selon les règles de la route.',
          'Ne comptez pas sur « j’ai le droit » — vérifiez que l’autre s’arrête vraiment.',
          'Un véhicule qui recule doit céder le passage à toute la circulation.',
        ],
      },
      {
        heading: 'Piétons, vélos et feux',
        body: 'Un feu vert ne garantit pas que le carrefour est libre. Avant d’entrer, assurez-vous qu’il n’y a ni piétons, ni cyclistes, ni véhicule bloqué à l’intérieur. À un passage, un piéton qui a commencé à traverser a la priorité.',
      },
      {
        heading: 'Quand quelque chose n’est pas clair',
        body: 'Si vous doutez de qui passe en premier, ralentissez et cédez. Céder la priorité n’est pas un échec ; c’est la façon sûre de résoudre une incertitude sur la route.',
      },
    ],
    keyPoints: [
      'Ralentissez avant chaque carrefour, même sur une route principale.',
      'Un conducteur qui tourne cède aux piétons et à ceux déjà engagés.',
      'En cas de doute, cédez.',
    ],
  },
  'laws-signals': {
    title: 'Clignotants, voies et dépassement',
    summary:
      'Comment annoncer vos intentions et comment dépasser sans surprendre personne.',
    blocks: [
      {
        heading: 'Le clignotant est un message anticipé',
        body: 'Mettez le clignotant avant de changer de voie, de tourner ou de vous arrêter, pas pendant la manœuvre. Le signal doit venir assez tôt pour qu’un autre conducteur réagisse, et s’arrêter une fois le virage terminé.',
      },
      {
        heading: 'Bien utiliser les voies',
        body: 'Roulez le plus à droite possible et réservez la voie de gauche au dépassement ou au tournant. Changez de voie seulement si elle est libre, avec clignotant, contrôle des rétroviseurs et coup d’œil à l’angle mort.',
      },
      {
        heading: 'Dépasser en sécurité',
        body: 'Ne dépassez que si la visibilité est bonne, la voie opposée libre et la loi l’autorise. Ne dépassez pas avant un passage, à un carrefour, dans un virage ou si la visibilité est masquée. En cas de doute, ne dépassez pas.',
        bullets: [
          'Avant : rétroviseurs, clignotant et regard sur la route.',
          'Pendant : vitesse régulière et distance sûre avec le véhicule dépassé.',
          'Après : revenez dans la voie seulement quand le véhicule dépassé est visible dans le rétroviseur.',
        ],
      },
    ],
    keyPoints: [
      'Clignotant avant, pas pendant.',
      'Roulez à droite et gardez la gauche pour dépasser.',
      'Dépasser est une décision de certitude, pas de patience.',
    ],
  },
  'signs-shapes': {
    title: 'Lire un panneau avant de lire le texte',
    summary:
      'La forme et la couleur disent presque tout : danger, interdiction, obligation ou information.',
    blocks: [
      {
        heading: 'Un langage de formes et de couleurs',
        body: 'Un panneau triangulaire à bord rouge est un panneau de danger : il vous prépare à un danger proche. Un cercle rouge est une interdiction ou une restriction, et un cercle bleu une obligation. Un panneau carré ou rectangulaire donne une information ou une indication.',
      },
      {
        heading: 'Les exceptions',
        body: 'Le panneau stop a sa forme octogonale propre, et le cédez-le-passage est un triangle inversé. La forme permet de les reconnaître même si le texte est couvert ou la visibilité mauvaise.',
        bullets: [
          'Un fond jaune sur un panneau de danger signale souvent des travaux ou une situation temporaire.',
          'Un panneau d’information peut indiquer un lieu, un parking ou un service.',
          'Le marquage au sol complète les panneaux ; il ne les remplace pas.',
        ],
      },
      {
        heading: 'Que faire en voyant un panneau',
        body: 'Reconnaissez la forme, traduisez-la en sens et adaptez votre conduite. Un panneau de danger exige de ralentir et de se préparer à des conditions changeantes ; un panneau d’interdiction n’est pas une recommandation.',
      },
    ],
    keyPoints: [
      'Triangle rouge : danger. Cercle rouge : interdiction. Cercle bleu : obligation.',
      'La forme du panneau fait partie de son sens.',
      'Un panneau jaune temporaire reste obligatoire.',
    ],
  },
  'signs-warning': {
    title: 'Panneaux de danger : le danger avant de le voir',
    summary:
      'Virage, carrefour, passage, enfants, chaussée glissante ou travaux — ce que chaque panneau demande.',
    blocks: [
      {
        heading: 'Un panneau de danger n’est pas décoratif',
        body: 'Un panneau de danger annonce un danger que vous ne voyez peut-être pas encore. Il exige d’adapter la vitesse, d’augmenter la marge et de regarder davantage. Si vous continuez à la même vitesse, le panneau n’a pas rempli son rôle.',
      },
      {
        heading: 'Des exemples à reconnaître immédiatement',
        body: 'Virage serré, carrefour, passage piéton, enfants sur la route, chaussée glissante, pente dangereuse, travaux et passage d’animaux. Sur une route rapide, un panneau de danger concerne généralement le tronçon qui suit, donc n’attendez pas de voir le danger lui-même.',
        bullets: [
          'Enfants près de la route : ralentir nettement et être prêt à s’arrêter.',
          'Chaussée glissante : réduire la vitesse et éviter les virages brusques et le freinage fort.',
          'Travaux : suivre la voie balisée et rester à faible vitesse.',
        ],
      },
      {
        heading: 'Si vous manquez un panneau',
        body: 'Si vous remarquez un panneau tard, ne freinez pas brusquement et ne faites pas de manœuvre brusque. Ralentissez progressivement et continuez prudemment. Un freinage soudain peut créer un danger plus grand que celui annoncé.',
      },
    ],
    keyPoints: [
      'Danger = ralentir et regarder, pas seulement savoir.',
      'Le danger du panneau se trouve devant vous.',
      'Panneau manqué ? Ralentissez progressivement, sans freinage brusque.',
    ],
  },
  'signs-control': {
    title: 'Stop, cédez le passage et interdictions',
    summary:
      'Les panneaux qui exigent une action immédiate — et leurs différences.',
    blocks: [
      {
        heading: 'Stop ou cédez le passage',
        body: 'Au panneau stop, vous devez marquer un arrêt complet avant la ligne ou avant le carrefour, même si la route semble libre. Au cédez-le-passage, il n’y a pas d’obligation absolue de s’arrêter, mais vous devez céder à ceux qui ont le droit — et vous arrêter si nécessaire.',
      },
      {
        heading: 'Interdictions et restrictions',
        body: 'Un cercle rouge interdit une action : entrer, tourner, dépasser, stationner ou dépasser la vitesse indiquée. La restriction s’applique là où le panneau est placé, jusqu’à un panneau qui l’annule ou jusqu’au carrefour suivant si tel est le cas.',
      },
      {
        heading: 'Obligations',
        body: 'Un panneau bleu impose ce qu’il faut faire : tourner dans une direction, rouler dans une voie ou emprunter une route. Prévoyez votre voie à l’avance plutôt que de tourner tardivement.',
        bullets: [
          'Un panneau ne supprime pas le besoin de regarder et de conduire selon les conditions.',
          'Un feu et un panneau peuvent agir ensemble ; respectez les deux.',
          'Si un panneau est masqué ou peu clair, conduisez avec une prudence accrue.',
        ],
      },
    ],
    keyPoints: [
      'Stop = arrêt complet. Cédez = céder, et s’arrêter si besoin.',
      'Cercle rouge interdit ; cercle bleu impose.',
      'Choisissez votre voie avant le carrefour.',
    ],
  },
  'safety-belts': {
    title: 'Ceintures, sièges enfants et bonne position',
    summary:
      'Ce qui arrive au corps lors d’un arrêt brutal, et comment régler le siège pour que la protection fonctionne.',
    blocks: [
      {
        heading: 'La ceinture est un système, pas un accessoire',
        body: 'Lors d’un arrêt brutal, le corps continue d’avancer. La ceinture répartit la force sur les os solides et évite l’impact avec l’habitacle ou l’éjection du siège. Elle doit être utilisée à chaque trajet, y compris à l’arrière et sur les courts trajets.',
      },
      {
        heading: 'Les enfants — selon la loi et la taille',
        body: 'Les enfants qui ne sont pas assez grands ou âgés pour une ceinture normale doivent utiliser un siège enfant ou un rehausseur adapté, conformément à la loi. Ne passez pas un enfant à l’avant avant que ce soit permis, et adaptez toujours le siège à sa taille et à son poids.',
        bullets: [
          'Un siège adapté à l’âge, au poids et à la taille — pas seulement à l’âge.',
          'Un airbag ne remplace ni la ceinture ni le siège enfant.',
          'Fixez le siège selon les instructions du fabricant.',
        ],
      },
      {
        heading: 'Une position qui protège',
        body: 'L’appuie-tête doit soutenir la tête au niveau des yeux ou des oreilles, et le dos rester contre le dossier. Les objets lourds non fixés dans l’habitacle peuvent devenir des projectiles lors d’un arrêt brutal.',
      },
    ],
    keyPoints: [
      'Une ceinture à chaque trajet et pour chaque passager.',
      'Un siège enfant selon l’âge, le poids et la taille — pas par confort.',
      'Un appuie-tête et un siège réglé réduisent les blessures.',
    ],
  },
  'safety-weather': {
    title: 'Pluie, brouillard et mauvaise visibilité',
    summary:
      'Pourquoi la route change quand la pluie commence, et ce qu’il faut changer dans sa conduite.',
    blocks: [
      {
        heading: 'Le début de la pluie est le moment le plus dangereux',
        body: 'Au début de la pluie, la poussière et l’huile se mélangent à l’eau et forment une couche glissante. Ralentissez avant que la route ne paraisse glissante, augmentez la marge et évitez les coups de volant brusques.',
      },
      {
        heading: 'Conduire sous la pluie et dans l’eau',
        body: 'L’eau sur la route peut faire perdre l’adhérence (aquaplaning). Si cela arrive, ne freinez pas brusquement et ne tournez pas le volant brutalement ; relâchez légèrement l’accélérateur, gardez le volant stable et laissez les pneus retrouver l’adhérence.',
        bullets: [
          'Utilisez essuie-glaces et feux selon la visibilité.',
          'Augmentez la marge à au moins deux secondes — davantage sous forte pluie.',
          'Évitez de traverser des flaques de profondeur inconnue.',
        ],
      },
      {
        heading: 'Brouillard et faible visibilité',
        body: 'Dans le brouillard, roulez lentement, avec les feux adaptés, et cherchez les lignes de rive ou une clôture pour tenir votre voie. Ne vous laissez pas éblouir par les feux de route d’un autre véhicule. Si la visibilité est trop faible, arrêtez-vous dans un lieu sûr jusqu’à amélioration.',
      },
    ],
    keyPoints: [
      'Ralentissez au début de la pluie, pas après avoir glissé.',
      'Aquaplaning : moins d’accélérateur, volant stable, pas de freinage brusque.',
      'Faible visibilité — ralentir, allumer les feux, s’arrêter si nécessaire.',
    ],
  },
  'safety-fatigue': {
    title: 'Fatigue, distraction et conduite sûre',
    summary:
      'Le plus grand danger n’est pas toujours la route — parfois il est dans la voiture.',
    blocks: [
      {
        heading: 'La fatigue altère même sans s’endormir',
        body: 'La fatigue ralentit le temps de réaction et nuit à l’évaluation des distances. Bâillements, yeux lourds, sorties manquées et difficulté à tenir sa voie sont des signes d’alerte. Une courte pause café ne remplace pas le sommeil.',
      },
      {
        heading: 'La distraction',
        body: 'Un message, le GPS, la nourriture ou une conversation intense détournent les yeux et l’esprit de la route. Avant de partir, réglez le GPS, coupez les alertes et rangez la voiture. Conduire exige toute l’attention.',
        bullets: [
          'N’écrivez pas et ne lisez pas de messages en conduisant.',
          'Les passagers peuvent aider pour le GPS et les alertes.',
          'Passagers bruyants ou gênants — demandez un moment de calme.',
        ],
      },
      {
        heading: 'Planifier évite la fatigue',
        body: 'Partez après un sommeil suffisant, prévoyez des pauses sur les longs trajets et évitez de conduire aux heures où le corps a l’habitude de dormir. Si vous êtes fatigué, arrêtez-vous dans un lieu sûr ; ne continuez pas « encore un peu ».',
      },
    ],
    keyPoints: [
      'La fatigue affecte les réactions avant le vertige.',
      'Coupez écrans et alertes avant de partir.',
      'Une pause sûre vaut mieux que continuer fatigué.',
    ],
  },
  'vehicle-tires': {
    title: 'Pneus : votre seule adhérence sur la route',
    summary:
      'Pression, profondeur de sculpture et usure irrégulière — quoi vérifier et quand.',
    blocks: [
      {
        heading: 'La bonne pression',
        body: 'La pression est fixée par les instructions du fabricant, pas par l’apparence du pneu. Vérifiez-la à froid, avant un long trajet ou au moins une fois par mois. Une pression faible augmente la distance de freinage, la consommation et l’usure des flancs.',
      },
      {
        heading: 'Profondeur et usure',
        body: 'Une sculpture peu profonde évacue moins l’eau et augmente le risque d’aquaplaning. Une usure irrégulière, des boursouflures, des fissures ou un objet coincé exigent un contrôle professionnel. La roue de secours doit aussi être saine et gonflée.',
        bullets: [
          'Vérifiez les deux côtés et le flanc de chaque pneu.',
          'Une usure d’un seul côté indique souvent un problème de géométrie ou de pression.',
          'Changez les pneus selon le fabricant et la loi, pas seulement quand ils sont totalement usés.',
        ],
      },
      {
        heading: 'Pneus saisonniers',
        body: 'Dans des conditions hivernales rudes, adaptez les pneus à la route. Un pneu été ne remplace pas un pneu hiver lorsque la route est mouillée ou particulièrement froide.',
      },
    ],
    keyPoints: [
      'Vérifiez la pression à froid, selon le fabricant.',
      'Sculpture faible = moins d’évacuation d’eau et plus de glisse.',
      'Une usure irrégulière est un signal de contrôle.',
    ],
  },
  'vehicle-lights': {
    title: 'Feux, freins et tableau de bord',
    summary:
      'Comment repérer une panne avant qu’elle ne devienne une panne sur la route.',
    blocks: [
      {
        heading: 'La visibilité, c’est la sécurité',
        body: 'Feux avant, arrière, stop et clignotants sont votre moyen de communiquer avec les autres conducteurs. Vérifiez-les avant un trajet, surtout après un stationnement ou une réparation. Une ampoule grillée est une panne de sécurité.',
      },
      {
        heading: 'Freins : ce que l’on ressent',
        body: 'Pédale molle, vibrations, grincement persistant ou tirage d’un côté au freinage sont des signes à contrôler. Ne les ignorez pas. L’ABS empêche le blocage des roues, mais ne raccourcit pas la distance de freinage dans toutes les conditions.',
        bullets: [
          'Voyant rouge de frein allumé — arrêtez-vous en sécurité et faites contrôler.',
          'Voyant moteur clignotant — évitez la charge et faites vérifier rapidement.',
          'Si le frein change de sensation, ne continuez pas normalement.',
        ],
      },
      {
        heading: 'Une courte routine de contrôle',
        body: 'Avant un trajet : feux, pneus, rétroviseurs, liquide lave-glace et ceinture. Après : stationnement sûr, frein à main, fenêtres fermées et contrôle du véhicule. Une courte routine évite les surprises.',
      },
    ],
    keyPoints: [
      'Des feux qui fonctionnent, c’est communiquer avec la route.',
      'Un changement de sensation au frein exige un contrôle.',
      'Un contrôle rapide avant de partir évite les pannes.',
    ],
  },
  'vehicle-load': {
    title: 'Charge, chargement et coffre',
    summary:
      'Comment une charge mal fixée devient un danger — et ce qu’il ne faut pas oublier avant de partir.',
    blocks: [
      {
        heading: 'La charge doit rester en place',
        body: 'Lors d’un arrêt brutal, une charge non fixée continue d’avancer. Fixez les charges lourdes dans le coffre ou avec des sangles et filets, et gardez les objets lourds bas et aussi près du centre du véhicule que possible.',
      },
      {
        heading: 'Limites de poids',
        body: 'Chaque véhicule a une limite de poids total et une limite de charge par essieu. La surcharge modifie le comportement, allonge la distance de freinage et augmente l’usure des pneus. Ne dépassez pas la limite même si la voiture « s’en sort ».',
        bullets: [
          'Une charge haute peut déplacer le centre de gravité et augmenter le risque de retournement.',
          'Une charge de toit augmente la consommation et la sensibilité au vent.',
          'Assurez-vous que la charge ne gêne ni la visibilité ni l’éclairage.',
        ],
      },
      {
        heading: 'Avant de partir',
        body: 'Vérifiez que la charge est fixée, que portes et fenêtres sont fermées, que rien ne cache la plaque ou un feu, et que les pneus conviennent à la charge. Roulez à une vitesse adaptée et prenez les virages prudemment.',
      },
    ],
    keyPoints: [
      'Une charge mal fixée est un danger même sur un court trajet.',
      'Ne dépassez pas les limites de poids du véhicule.',
      'Charge basse, fixée et sans masquer la visibilité.',
    ],
  },
}

export const FR_SUBJECTS: Record<string, string> = {
  laws: 'Règles de circulation, vitesse, priorité et signaux — la base de chaque décision sur la route.',
  signs: 'Panneaux et marquages : forme, couleur et sens, sans par cœur.',
  safety: 'La sécurité en pratique : ceintures, météo, fatigue et distraction.',
  vehicle: 'Connaître son véhicule : pneus, freins, feux et charge — quoi vérifier et pourquoi.',
}
