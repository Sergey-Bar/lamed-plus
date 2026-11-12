import type { LocalizedLesson } from './curriculum'

export const ES_LESSONS: Record<string, LocalizedLesson> = {
  'laws-speed': {
    title: 'Velocidad, distancia de frenado y márgenes seguros',
    summary:
      'Por qué el límite de velocidad es un techo y no un objetivo, y cómo construir un margen de seguridad real.',
    blocks: [
      {
        heading: 'La velocidad es una decisión, no una costumbre',
        body: 'La velocidad máxima de una señal o de la ley es el límite superior en condiciones ideales. En carretera mojada, de noche, con niebla o con visibilidad bloqueada, la velocidad segura es menor. Circular al límite no garantiza poder detenerse a tiempo.',
      },
      {
        heading: 'Las tres distancias que conviene conocer',
        body: 'La distancia de reacción es el recorrido desde que detectas un peligro hasta que pisas el freno. La distancia de frenado es el recorrido del coche desde que frenas hasta que se detiene. Juntas forman la distancia de detención.',
        bullets: [
          'Cuanto mayor es la velocidad, más rápido crece la distancia de detención.',
          'Al duplicar la velocidad, la distancia de frenado crece unas cuatro veces.',
          'En carretera mojada o resbaladiza, la distancia de frenado aumenta aún más.',
        ],
      },
      {
        heading: 'Mantener el margen en la práctica',
        body: 'La regla sencilla es un margen de al menos dos segundos con el vehículo de delante. Con lluvia, de noche o si el vehículo de delante es pesado, auméntalo. Elige un punto de referencia en el borde de la vía y cuenta hasta que el vehículo de delante lo pase.',
      },
      {
        heading: 'Cómo circular a una velocidad segura',
        body: 'Mira lejos, detecta los peligros pronto y reduce la velocidad antes de una curva, un cruce o un paso — no en el último momento. Mantener una velocidad constante y previsible también facilita la conducción de los demás.',
      },
    ],
    keyPoints: [
      'El límite de velocidad es un máximo, no un objetivo.',
      'Un margen de al menos dos segundos — más en condiciones difíciles.',
      'Reduce la velocidad antes del peligro, no después.',
    ],
  },
  'laws-right-of-way': {
    title: 'Prioridad y cruces',
    summary:
      'Quién pasa realmente primero en un cruce y cómo evitar que dos conductores supongan cosas distintas.',
    blocks: [
      {
        heading: 'La prioridad es una regla, no un derecho',
        body: 'La prioridad existe para evitar que dos conductores decidan de forma distinta en el mismo instante. Aunque puedas pasar, debes acercarte al cruce despacio, mirar a ambos lados y estar listo para detenerte.',
      },
      {
        heading: '¿Quién pasa primero en un cruce?',
        body: 'Una señal de stop o de ceda el paso impone su significado. Un vehículo que gira debe ceder el paso a los peatones que cruzan la vía a la que entra. Un vehículo que entra en una vía debe ceder el paso a quienes ya circulan por ella.',
        bullets: [
          'En un cruce sin señales: reduce la velocidad, mira y cede según las reglas de circulación.',
          'No confíes en «tengo derecho» — comprueba que el otro realmente se detiene.',
          'Un vehículo que da marcha atrás debe ceder el paso a todo el tráfico.',
        ],
      },
      {
        heading: 'Peatones, bicicletas y semáforos',
        body: 'Un semáforo verde no garantiza que el cruce esté libre. Antes de entrar, asegúrate de que no hay peatones, ciclistas ni vehículos atascados dentro. En un paso, el peatón que ha empezado a cruzar tiene prioridad.',
      },
      {
        heading: 'Cuando algo no está claro',
        body: 'Si dudas de quién pasa primero, reduce la velocidad y cede. Ceder la prioridad no es un fracaso; es la forma segura de resolver la incertidumbre en la carretera.',
      },
    ],
    keyPoints: [
      'Reduce la velocidad antes de cada cruce, incluso en una vía principal.',
      'Quien gira cede a los peatones y a quienes ya están en el cruce.',
      'Ante la duda, cede.',
    ],
  },
  'laws-signals': {
    title: 'Intermitentes, carriles y adelantamiento',
    summary:
      'Cómo avisar de tus intenciones y cómo adelantar sin sorprender a nadie.',
    blocks: [
      {
        heading: 'El intermitente es un mensaje anticipado',
        body: 'Señaliza antes de cambiar de carril, girar o detenerte, no mientras lo haces. La señal debe llegar con tiempo para que otro conductor reaccione, y cesar cuando el giro ha terminado.',
      },
      {
        heading: 'Usar bien los carriles',
        body: 'Circula lo más a la derecha posible y deja el carril izquierdo para adelantar o girar. Cambia de carril solo cuando esté libre, con intermitente, espejos y un vistazo al ángulo muerto.',
      },
      {
        heading: 'Adelantar con seguridad',
        body: 'Adelanta solo si hay buena visibilidad, el carril contrario está libre y la ley lo permite. No adelantes antes de un paso, en un cruce, en una curva o si la visibilidad está bloqueada. Si no tienes certeza, no adelantes.',
        bullets: [
          'Antes: espejos, intermitente y mirada a la vía.',
          'Durante: velocidad constante y distancia segura con el vehículo adelantado.',
          'Después: vuelve al carril solo cuando el vehículo adelantado se vea en el espejo.',
        ],
      },
    ],
    keyPoints: [
      'Señaliza antes, no durante.',
      'Circula por la derecha y deja la izquierda para adelantar.',
      'Adelantar es una decisión de certeza, no de paciencia.',
    ],
  },
  'signs-shapes': {
    title: 'Leer una señal antes de leer el texto',
    summary:
      'La forma y el color lo dicen casi todo: peligro, prohibición, obligación o información.',
    blocks: [
      {
        heading: 'Un lenguaje de formas y colores',
        body: 'Una señal triangular con borde rojo es de peligro: te prepara para un riesgo cercano. Un círculo rojo es una prohibición o restricción, y un círculo azul una obligación. Una señal cuadrada o rectangular da información o indicación.',
      },
      {
        heading: 'Las excepciones',
        body: 'La señal de stop tiene su propia forma octogonal, y la de ceda el paso es un triángulo invertido. La forma permite reconocerlas aunque el texto esté cubierto o la visibilidad sea mala.',
        bullets: [
          'Un fondo amarillo en una señal de peligro suele indicar obras o una situación temporal.',
          'Una señal informativa puede indicar un lugar, aparcamiento o servicio.',
          'Las marcas viales complementan las señales; no las sustituyen.',
        ],
      },
      {
        heading: 'Qué hacer al ver una señal',
        body: 'Reconoce la forma, tradúcela en significado y adapta la conducción. Una señal de peligro exige reducir la velocidad y estar preparado para condiciones cambiantes; una de prohibición no es una recomendación.',
      },
    ],
    keyPoints: [
      'Triángulo rojo: peligro. Círculo rojo: prohibición. Círculo azul: obligación.',
      'La forma de la señal es parte de su significado.',
      'Una señal amarilla temporal también obliga.',
    ],
  },
  'signs-warning': {
    title: 'Señales de peligro: el riesgo antes de verlo',
    summary:
      'Curva, cruce, paso, niños, firme deslizante u obras — qué pide cada señal.',
    blocks: [
      {
        heading: 'Una señal de peligro no es decoración',
        body: 'Una señal de peligro anuncia un riesgo que quizá aún no ves. Exige ajustar la velocidad, aumentar el margen y mirar más. Si sigues a la misma velocidad, la señal no ha cumplido su función.',
      },
      {
        heading: 'Ejemplos que conviene reconocer de inmediato',
        body: 'Curva cerrada, cruce, paso de peatones, niños en la vía, firme deslizante, pendiente peligrosa, obras y paso de animales. En una vía rápida, la señal de peligro suele referirse al tramo inmediato, así que no esperes a ver el peligro.',
        bullets: [
          'Niños cerca de la vía: reduce mucho la velocidad y prepárate para parar.',
          'Firme deslizante: baja la velocidad y evita giros bruscos y frenazos.',
          'Obras: sigue el carril señalizado y mantén una velocidad baja.',
        ],
      },
      {
        heading: 'Qué pasa si te pierdes una señal',
        body: 'Si la ves tarde, no frenes de golpe ni hagas una maniobra brusca. Reduce la velocidad gradualmente y continúa con cuidado. Un frenazo puede crear un peligro mayor que el anunciado.',
      },
    ],
    keyPoints: [
      'Peligro = reducir y mirar, no solo saber.',
      'El peligro de la señal está delante de ti.',
      '¿Señal perdida? Reduce gradualmente, sin frenazos.',
    ],
  },
  'signs-control': {
    title: 'Stop, ceda el paso y prohibiciones',
    summary:
      'Las señales que exigen acción inmediata — y en qué se diferencian.',
    blocks: [
      {
        heading: 'Stop frente a ceda el paso',
        body: 'En un stop debes detenerte por completo antes de la línea o del cruce, aunque la vía parezca libre. En un ceda el paso no hay obligación absoluta de parar, pero debes ceder a quienes tienen derecho — y detenerte si es necesario.',
      },
      {
        heading: 'Prohibiciones y restricciones',
        body: 'Un círculo rojo prohíbe una acción: entrar, girar, adelantar, aparcar o superar la velocidad indicada. La restricción se aplica donde está la señal, hasta una señal que la anule o hasta el siguiente cruce si así se establece.',
      },
      {
        heading: 'Obligaciones',
        body: 'Una señal azul impone lo que debes hacer: girar en una dirección, circular por un carril o usar una vía. Planifica el carril con antelación en lugar de girar tarde.',
        bullets: [
          'Una señal no elimina la necesidad de mirar y conducir según las condiciones.',
          'Un semáforo y una señal pueden actuar juntos; respeta ambos.',
          'Si una señal está tapada o no está clara, conduce con especial cuidado.',
        ],
      },
    ],
    keyPoints: [
      'Stop = detención completa. Ceda = ceder y parar si hace falta.',
      'Círculo rojo prohíbe; círculo azul obliga.',
      'Elige el carril antes del cruce.',
    ],
  },
  'safety-belts': {
    title: 'Cinturones, sillas infantiles y postura correcta',
    summary:
      'Qué le pasa al cuerpo en una frenada brusca y cómo ajustar el asiento para que la protección funcione.',
    blocks: [
      {
        heading: 'El cinturón es un sistema, no un accesorio',
        body: 'En una detención brusca el cuerpo sigue avanzando. El cinturón reparte la fuerza por los huesos fuertes y evita el impacto con el interior o salir del asiento. Debe usarse en cada viaje, también detrás y en trayectos cortos.',
      },
      {
        heading: 'Niños — por ley y por tamaño',
        body: 'Los niños que no tienen altura o edad para un cinturón normal deben usar una silla o elevador adecuados, conforme a la ley. No pases a un niño al asiento delantero antes de que esté permitido y adapta siempre la silla a su altura y peso.',
        bullets: [
          'Silla adaptada a edad, peso y altura — no solo a la edad.',
          'El airbag no sustituye al cinturón ni a la silla.',
          'Fija la silla según las instrucciones del fabricante.',
        ],
      },
      {
        heading: 'Una postura que protege',
        body: 'El reposacabezas debe sostener la cabeza a la altura de los ojos u orejas, y la espalda debe quedar contra el respaldo. Los objetos pesados sin fijar en el habitáculo pueden convertirse en proyectiles en una frenada brusca.',
      },
    ],
    keyPoints: [
      'Cinturón en cada viaje y para cada pasajero.',
      'Silla infantil por edad, peso y altura — no por comodidad.',
      'Reposacabezas y asiento ajustado reducen las lesiones.',
    ],
  },
  'safety-weather': {
    title: 'Lluvia, niebla y poca visibilidad',
    summary:
      'Por qué cambia la carretera cuando empieza a llover y qué cambiar al conducir.',
    blocks: [
      {
        heading: 'El momento en que empieza a llover es el más peligroso',
        body: 'Al inicio de la lluvia, el polvo y el aceite se mezclan con el agua y forman una capa resbaladiza. Reduce la velocidad antes de que la vía se note resbaladiza, aumenta el margen y evita giros bruscos.',
      },
      {
        heading: 'Conducir con lluvia y cruzar agua',
        body: 'El agua en la vía puede hacer perder agarre (aquaplaning). Si ocurre, no frenes de golpe ni gires el volante bruscamente; suelta un poco el acelerador, mantén el volante firme y deja que los neumáticos recuperen agarre.',
        bullets: [
          'Usa limpiaparabrisas y luces según la visibilidad.',
          'Aumenta el margen a dos segundos como mínimo — más con lluvia fuerte.',
          'Evita cruzar charcos de profundidad desconocida.',
        ],
      },
      {
        heading: 'Niebla y poca visibilidad',
        body: 'Con niebla circula despacio, con las luces adecuadas, y busca las líneas del borde o una valla para mantener el carril. No te deslumbren las luces largas de otro vehículo. Si la visibilidad es demasiado baja, detente en un lugar seguro hasta que mejore.',
      },
    ],
    keyPoints: [
      'Reduce al empezar la lluvia, no después de resbalar.',
      'Aquaplaning: menos acelerador, volante firme, sin frenazos.',
      'Con poca visibilidad — reduce, enciende luces y detente si hace falta.',
    ],
  },
  'safety-fatigue': {
    title: 'Fatiga, distracciones y conducción segura',
    summary:
      'El mayor peligro no siempre está en la vía — a veces está dentro del coche.',
    blocks: [
      {
        heading: 'La fatiga afecta aunque no te duermas',
        body: 'La fatiga ralentiza la reacción y perjudica el cálculo de distancias. Bostezos, ojos pesados, salidas perdidas y dificultad para mantener el carril son señales de aviso. Una parada corta para café no sustituye al sueño.',
      },
      {
        heading: 'La distracción',
        body: 'Un mensaje, el navegador, la comida o una conversación intensa apartan los ojos y la mente de la vía. Antes de salir, configura el navegador, silencia las alertas y ordena el coche. Conducir exige toda la atención.',
        bullets: [
          'No escribas ni leas mensajes mientras conduces.',
          'Los pasajeros pueden ayudar con el navegador y las alertas.',
          'Pasajeros ruidosos o que distraen — pide un momento de silencio.',
        ],
      },
      {
        heading: 'Planificar evita la fatiga',
        body: 'Sal tras dormir lo suficiente, planifica paradas en viajes largos y evita conducir a horas en que el cuerpo suele dormir. Si estás cansado, detente en un lugar seguro; no sigas «solo un poco más».',
      },
    ],
    keyPoints: [
      'La fatiga afecta la reacción antes de que sientas mareo.',
      'Apaga pantallas y alertas antes de salir.',
      'Una parada segura es mejor que seguir cansado.',
    ],
  },
  'vehicle-tires': {
    title: 'Neumáticos: tu único agarre en la vía',
    summary:
      'Presión, profundidad del dibujo y desgaste irregular — qué revisar y cuándo.',
    blocks: [
      {
        heading: 'Presión correcta',
        body: 'La presión la fija el fabricante, no el aspecto del neumático. Revísala en frío, antes de un viaje largo o al menos una vez al mes. Una presión baja aumenta la distancia de frenado, el consumo y el desgaste del flanco.',
      },
      {
        heading: 'Profundidad y desgaste',
        body: 'Un dibujo poco profundo evacua menos agua y aumenta el riesgo de aquaplaning. El desgaste irregular, los bultos, las grietas o un objeto clavado exigen una revisión profesional. La rueda de repuesto también debe estar sana e inflada.',
        bullets: [
          'Revisa ambos lados y el flanco de cada neumático.',
          'El desgaste en un lado suele indicar un problema de alineación o presión.',
          'Cambia los neumáticos según el fabricante y la ley, no solo cuando estén totalmente gastados.',
        ],
      },
      {
        heading: 'Neumáticos de temporada',
        body: 'En condiciones invernales duras, adapta los neumáticos a la vía. Un neumático de verano no sustituye a uno de invierno cuando la vía está mojada o especialmente fría.',
      },
    ],
    keyPoints: [
      'Revisa la presión en frío, según el fabricante.',
      'Dibujo poco profundo = menos evacuación de agua y más deslizamiento.',
      'El desgaste irregular es señal de revisión.',
    ],
  },
  'vehicle-lights': {
    title: 'Luces, frenos y salpicadero',
    summary: 'Cómo detectar una avería antes de que ocurra en la vía.',
    blocks: [
      {
        heading: 'La visibilidad es seguridad',
        body: 'Luces delanteras, traseras, de freno e intermitentes son tu forma de comunicarte con los demás conductores. Revísalas antes de un viaje, sobre todo tras estar parado o una reparación. Una bombilla fundida es una avería de seguridad.',
      },
      {
        heading: 'Frenos: lo que se siente',
        body: 'Pedal blando, vibración, chirrido persistente o desviación al frenar son señales para revisar. No las ignores. El ABS evita el bloqueo de ruedas, pero no acorta la distancia de frenado en todas las condiciones.',
        bullets: [
          'Luz roja de freno encendida — detente con seguridad y revisa.',
          'Luz de motor parpadeando — evita la carga y revisa pronto.',
          'Si el freno se siente distinto, no sigas conduciendo con normalidad.',
        ],
      },
      {
        heading: 'Una rutina breve de revisión',
        body: 'Antes de salir: luces, neumáticos, espejos, líquido limpiaparabrisas y cinturón. Después: aparcamiento seguro, freno de mano, ventanas cerradas y revisión del coche. Una rutina breve evita sorpresas.',
      },
    ],
    keyPoints: [
      'Luces que funcionan son comunicación con la vía.',
      'Un cambio en el tacto del freno exige revisión.',
      'Una revisión breve antes de salir evita averías.',
    ],
  },
  'vehicle-load': {
    title: 'Carga, equipaje y maletero',
    summary:
      'Cómo una carga sin asegurar se convierte en peligro — y qué no olvidar antes de salir.',
    blocks: [
      {
        heading: 'La carga debe quedarse en su sitio',
        body: 'En una detención brusca, una carga sin asegurar sigue moviéndose. Asegura la carga pesada en el maletero o con correas y redes, y mantén los objetos pesados bajos y lo más cerca posible del centro del coche.',
      },
      {
        heading: 'Límites de peso',
        body: 'Cada vehículo tiene un límite de peso total y un límite por eje. La sobrecarga cambia el comportamiento, alarga la distancia de frenado y aumenta el desgaste de los neumáticos. No superes el límite aunque el coche «pueda».',
        bullets: [
          'Una carga alta puede desplazar el centro de gravedad y aumentar el riesgo de vuelco.',
          'La carga en el techo aumenta el consumo y la sensibilidad al viento.',
          'Asegúrate de que la carga no impide la visibilidad ni la iluminación.',
        ],
      },
      {
        heading: 'Antes de salir',
        body: 'Comprueba que la carga está sujeta, que puertas y ventanas están cerradas, que nada tapa la matrícula ni una luz, y que los neumáticos son adecuados para la carga. Circula a una velocidad adecuada y toma las curvas con cuidado.',
      },
    ],
    keyPoints: [
      'Una carga sin asegurar es peligrosa incluso en un trayecto corto.',
      'No superes los límites de peso del vehículo.',
      'Carga baja, sujeta y sin bloquear la visibilidad.',
    ],
  },
}

export const ES_SUBJECTS: Record<string, string> = {
  laws: 'Normas de circulación, velocidad, prioridad y señales: la base de cada decisión en la vía.',
  signs: 'Señales y marcas viales: forma, color y significado, sin memorizar.',
  safety: 'Seguridad práctica: cinturones, clima, fatiga y distracciones.',
  vehicle: 'Conocer el vehículo: neumáticos, frenos, luces y carga — qué revisar y por qué.',
}
