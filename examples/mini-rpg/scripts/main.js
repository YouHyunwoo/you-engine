import '../../../you/math/vector.js'
import '../../../you/math/geometry.js'
import { You } from '../../../you/you.js'
import { MiniRPG } from './game.js'

You.run({
  screens: {
    main: {
      canvas: document.querySelector('#game'),
      size: [800, 600]
    }
  },
  applications: [new MiniRPG({ mainScreen: 'main' })]
})
