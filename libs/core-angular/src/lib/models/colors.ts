export function rgb2hex(color: string) {
  return isRGBColor(color)
    ? '#' +
        color
          .match(/\d+/g)
          .map((x) => (+x).toString(16).padStart(2, '0'))
          .join('')
    : color
}

export function isRGBColor(color: string) {
  return /rgba?\([0-9,\s]*\)/.test(color)
}

export const ColorPalettes = [
  {
    label: '3',
    colors: [
      {
        colors: ['#cb997e', '#ddbea9', '#ffe8d6'],
        keywords: ['warm', 'vintage', 'gradient', 'monochromatic']
      },
    ]
  },
  {
    label: '4',
    colors: [
      {
        colors: ['#587850', '#709078', '#78B0A0', '#F8D0B0']
      },
      {
        colors: ['#d4e09b', '#f6f4d2', '#cbdfbd', '#f19c79'],
        keywords: ['pastel', 'gradient']
      },
      {
        colors: ['#ffa69e', '#faf3dd', '#b8f2e6', '#aed9e0'],
        keywords: ['pastel', 'turquoise', 'gradient']
      },
      {
        colors: ['#003049', '#d62828', '#f77f00', '#fcbf49'],
        keywords: ['orange']
      },
      {
        colors: ['#219ebc', '#023047', '#ffb703', '#fb8500'],
        keywords: ['blue', 'orange']
      },
      {
        colors: ['#26547c', '#ef476f', '#ffd166', '#06d6a0'],
        keywords: []
      },
      {
        colors: ['#2b2d42', '#8d99ae', '#edf2f4', '#ef233c'],
        keywords: []
      },
      {
        colors: ['#70d6ff', '#ff70a6', '#ff9770', '#ffd670'],
        keywords: ['pastel', 'orange']
      },
      {
        colors: ['#606c38', '#283618', '#fefae0', '#dda15e'],
        keywords: ['green']
      },
      {
        colors: ['#333333', '#d5ccc7', '#a9a29c', '#28262b'],
        keywords: []
      },
      {
        colors: ['#f1faee', '#a8dadc', '#457b9d', '#1d3557'],
        keywords: ['cold', 'gradient']
      },
      {
        colors: ['#3c1518', '#69140e', '#a44200', '#d58936'],
        keywords: ['warm', 'gradient']
      },
      {
        colors: ['#ef476f', '#ffd166', '#06d6a0', '#118ab2'],
        keywords: []
      },
      {
        colors: ['#191d32', '#282f44', '#453a49', '#6d3b47'],
        keywords: ['dark', 'gradient']
      },
      {
        colors: ['#d7dace', '#ffe9b3', '#ffdc74', '#ffc176'],
        keywords: ['warm', 'pastel', 'vintage', 'orange', 'gradient']
      },
      {
        colors: ['#001524', '#15616d', '#ffecd1', '#ff7d00'],
        keywords: []
      },
      {
        colors: ['#880d1e', '#dd2d4a', '#f26a8d', '#f49cbb'],
        keywords: ['red', 'pink', 'gradient']
      },
      {
        colors: ['#ffcdb2', '#ffb4a2', '#e5989b', '#b5838d'],
        keywords: ['warm', 'red', 'gradient']
      },
      {
        colors: ['#463f3a', '#8a817c', '#bcb8b1', '#f4f3ee'],
        keywords: ['warm', 'gray', 'gradient']
      },
      {
        colors: ['#d8e2dc', '#ffe5d9', '#ffcad4', '#f4acb7'],
        keywords: ['pastel', 'red', 'gradient']
      },
      {
        colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261'],
        keywords: ['orange']
      },
      {
        colors: ['#000000', '#14213d', '#fca311', '#e5e5e5'],
        keywords: ['gray']
      },
      {
        colors: ['#006d77', '#83c5be', '#edf6f9', '#ffddd2'],
        keywords: ['turquoise', 'gradient']
      },
      {
        colors: ['#dabfff', '#907ad6', '#4f518c', '#2c2a4a'],
        keywords: ['violet', 'cold', 'gradient']
      },
      {
        colors: ['#0d3b66', '#faf0ca', '#f4d35e', '#ee964b'],
        keywords: ['gradient']
      },
      {
        colors: ['#d0b8ac', '#f3d8c7', '#efe5dc', '#fbfefb'],
        keywords: ['pastel', 'gray', 'gradient']
      },
      {
        colors: ['#efc7c2', '#ffe5d4', '#bfd3c1', '#68a691'],
        keywords: ['gradient']
      },
      {
        colors: ['#5fad56', '#f2c14e', '#f78154', '#4d9078'],
        keywords: ['green', 'orange']
      },
      {
        colors: ['#f7b267', '#f79d65', '#f4845f', '#f27059'],
        keywords: ['orange', 'warm', 'pastel', 'red', 'gradient']
      },
      {
        colors: ['#05668d', '#028090', '#00a896', '#02c39a'],
        keywords: ['cold', 'turquoise', 'gradient']
      },
      {
        colors: ['#ffee32', '#ffd100', '#202020', '#4d4d4d'],
        keywords: ['yellow', 'gray', 'gradient']
      },
      {
        colors: ['#f4f1de', '#e07a5f', '#3d405b', '#81b29a'],
        keywords: []
      },
      {
        colors: ['#04151f', '#183a37', '#efd6ac', '#c44900'],
        keywords: []
      },
      {
        colors: ['#687351', '#9ba17f', '#e8e4db', '#c9c1ae'],
        keywords: ['green', 'warm', 'vintage', 'gradient']
      },
      {
        colors: ['#813405', '#d45113', '#f9a03f', '#f8dda4'],
        keywords: ['warm', 'orange']
      },
      {
        colors: ['#ffbe0b', '#fb5607', '#ff006e', '#8338ec'],
        keywords: ['orange']
      },
      {
        colors: ['#ffc09f', '#ffee93', '#fcf5c7', '#a0ced9'],
        keywords: ['pastel']
      },
      {
        colors: ['#90f1ef', '#ffd6e0', '#ffef9f', '#c1fba4'],
        keywords: ['pastel']
      },
      {
        colors: ['#0a2463', '#3e92cc', '#fffaff', '#d8315b'],
        keywords: ['blue']
      },
      {
        colors: ['#9b5de5', '#f15bb5', '#fee440', '#00bbf9'],
        keywords: []
      },
      {
        colors: ['#f79256', '#fbd1a2', '#7dcfb6', '#00b2ca'],
        keywords: ['turquoise', 'gradient']
      },
      {
        colors: ['#540d6e', '#ee4266', '#ffd23f', '#3bceac'],
        keywords: []
      },
      {
        colors: ['#5aa9e6', '#7fc8f8', '#f9f9f9', '#ffe45e'],
        keywords: ['blue', 'pastel', 'gradient']
      },
      {
        colors: ['#403f4c', '#2c2b3c', '#1b2432', '#121420'],
        keywords: ['cold', 'dark', 'gradient']
      },
      {
        colors: ['#03045e', '#0077b6', '#00b4d8', '#90e0ef'],
        keywords: ['blue', 'cold', 'turquoise', 'gradient']
      },
      {
        colors: ['#e7ecef', '#274c77', '#6096ba', '#a3cef1'],
        keywords: ['cold', 'blue', 'monochromatic']
      },
    ]
  },
  {
    label: '5',
    colors: [
      {
        colors: ['#cdb4db', '#ffc8dd', '#ffafcc', '#bde0fe', '#a2d2ff']
      },
      {
        colors: ['#606c38', '#283618', '#fefae0', '#dda15e', '#bc6c25']
      },
      {
        colors: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51']
      },
      {
        colors: ['#ccd5ae', '#e9edc9', '#fefae0', '#faedcd', '#d4a373']
      },
      {
        colors: ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500']
      },
      {
        colors: ['#e63946', '#f1faee', '#a8dadc', '#457b9d', '#1d3557']
      },
      {
        colors: ['#ffe5ec', '#ffc2d1', '#ffb3c6', '#ff8fab', '#fb6f92'],
        keywords: ['warm', 'pastel', 'pink', 'gradient', 'monochromatic']
      },
      {
        colors: ['#07beb8', '#3dccc7', '#68d8d6', '#9ceaef', '#c4fff9'],
        keywords: ['turquoise', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#00a6fb', '#0582ca', '#006494', '#003554', '#051923'],
        keywords: ['blue', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#ef6351', '#f38375', '#f7a399', '#fbc3bc', '#ffe3e0'],
        keywords: ['red', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#03b5aa', '#037971', '#023436', '#00bfb3', '#049a8f'],
        keywords: ['turquoise', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#022f40', '#38aecc', '#0090c1', '#183446', '#046e8f'],
        keywords: ['blue', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#00b9ae', '#037171', '#03312e', '#02c3bd', '#009f93'],
        keywords: ['turquoise', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#274060', '#335c81', '#65afff', '#1b2845', '#5899e2'],
        keywords: ['cold', 'blue', 'monochromatic']
      },
      {
        colors: ['#f6f2f0', '#f3e7e4', '#e7d1c9', '#f1e7dd', '#d0b49f'],
        keywords: ['gray', 'warm', 'pastel', 'gradient', 'monochromatic']
      },
      {
        colors: ['#f6f6f6', '#e8e8e8', '#333333', '#990100', '#b90504'],
        keywords: ['gray', 'red', 'gradient', 'monochromatic']
      },
      {
        colors: ['#c41e3d', '#7d1128', '#ff2c55', '#3c0919', '#e2294f'],
        keywords: ['red', 'warm', 'monochromatic']
      },
      {
        colors: ['#50ffb1', '#4fb286', '#3c896d', '#546d64', '#4d685a'],
        keywords: ['green', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#c9fbff', '#c2fcf7', '#85bdbf', '#57737a', '#040f0f'],
        keywords: ['turquoise', 'gradient', 'monochromatic']
      },
      {
        colors: ['#ffd289', '#facc6b', '#ffd131', '#f5b82e', '#f4ac32'],
        keywords: ['warm', 'orange', 'gradient', 'monochromatic']
      },
      {
        colors: ['#bee6ce', '#bcffdb', '#8dffcd', '#68d89b', '#4f9d69'],
        keywords: ['cold', 'green', 'gradient', 'monochromatic']
      },
      {
        colors: ['#a1cca5', '#8fb996', '#709775', '#415d43', '#111d13'],
        keywords: ['green', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#595959', '#7f7f7f', '#a5a5a5', '#cccccc', '#f2f2f2'],
        keywords: ['gray', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#f4dbd8', '#bea8a7', '#c09891', '#775144', '#2a0800'],
        keywords: ['gradient', 'monochromatic']
      },
      {
        colors: ['#f4effa', '#2f184b', '#532b88', '#9b72cf', '#c8b1e4'],
        keywords: ['cold', 'violet', 'gradient', 'monochromatic']
      },
      {
        colors: ['#6f4e37', '#a67b5b', '#fed8b1', '#d99a6c', '#ecb176'],
        keywords: ['brown', 'warm', 'vintage', 'gradient', 'monochromatic']
      },
      {
        colors: ['#e4b1ab', '#fbc3bc', '#fde1de', '#fef0ef', '#ffffff'],
        keywords: ['warm', 'pastel', 'gray', 'gradient', 'monochromatic']
      },
      {
        colors: ['#5e3719', '#735238', '#886e58', '#9d8977', '#b2a496'],
        keywords: ['brown', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#002029', '#00303d', '#004052', '#005066', '#00607a'],
        keywords: ['cold', 'dark', 'blue', 'gradient', 'monochromatic']
      },
      {
        colors: ['#0f0606', '#200b0b', '#2f0000', '#490000', '#650000'],
        keywords: ['dark', 'red', 'gradient', 'monochromatic']
      },
      {
        colors: ['#ede0d4', '#e6ccb2', '#ddb892', '#b08968', '#7f5539'],
        keywords: ['warm', 'vintage', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#72bbce', '#8dc8d8', '#a7d5e1', '#c2e2ea', '#dceef3'],
        keywords: ['blue', 'cold', 'pastel', 'gradient', 'monochromatic']
      },
      {
        colors: ['#e6ccb2', '#ddb892', '#b08968', '#7f5539', '#9c6644'],
        keywords: ['warm', 'vintage', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#deefb7', '#c8dd96', '#9bb55f', '#728740', '#56682c'],
        keywords: ['green', 'warm', 'vintage', 'gradient', 'monochromatic']
      }
    ]
  },
  {
    label: 'Diverging',
    colors: [
      {
        colors: [
          '#f72585',
          '#b5179e',
          '#7209b7',
          '#560bad',
          '#480ca8',
          '#3a0ca3',
          '#3f37c9',
          '#4361ee',
          '#4895ef',
          '#4cc9f0'
        ]
      },
      {
        colors: [
          '#582f0e',
          '#7f4f24',
          '#936639',
          '#a68a64',
          '#b6ad90',
          '#c2c5aa',
          '#a4ac86',
          '#656d4a',
          '#414833',
          '#333d29'
        ]
      }
    ]
  },
  {
    label: 'Sequential (Single Hue)',
    colors: [
      {
        colors: ['#03045e', '#023e8a', '#0077b6', '#0096c7', '#00b4d8', '#48cae4', '#90e0ef', '#ade8f4', '#caf0f8']
      },
      {
        colors: ['#ede0d4', '#e6ccb2', '#ddb892', '#b08968', '#7f5539', '#9c6644'],
        keywords: ['warm', 'vintage', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#f8f9fa', '#e9ecef', '#dee2e6', '#ced4da', '#adb5bd', '#6c757d', '#495057', '#343a40', '#212529'],
        keywords: ['gray', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#edc4b3',
          '#e6b8a2',
          '#deab90',
          '#d69f7e',
          '#cd9777',
          '#c38e70',
          '#b07d62',
          '#9d6b53',
          '#8a5a44',
          '#774936'
        ],
        keywords: ['warm', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#590d22',
          '#800f2f',
          '#a4133c',
          '#c9184a',
          '#ff4d6d',
          '#ff758f',
          '#ff8fa3',
          '#ffb3c1',
          '#ffccd5',
          '#fff0f3'
        ],
        keywords: ['pink', 'warm', 'red', 'gradient', 'monochromatic']
      },
      {
        colors: ['#edf2fb', '#e2eafc', '#d7e3fc', '#ccdbfd', '#c1d3fe', '#b6ccfe', '#abc4ff'],
        keywords: ['cold', 'pastel', 'blue', 'gradient', 'monochromatic']
      },
      {
        colors: ['#e9f5db', '#cfe1b9', '#b5c99a', '#97a97c', '#87986a', '#718355'],
        keywords: ['cold', 'vintage', 'green', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ff0a54',
          '#ff477e',
          '#ff5c8a',
          '#ff7096',
          '#ff85a1',
          '#ff99ac',
          '#fbb1bd',
          '#f9bec7',
          '#f7cad0',
          '#fae0e4'
        ],
        keywords: ['pink', 'warm', 'red', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#641220',
          '#6e1423',
          '#85182a',
          '#a11d33',
          '#a71e34',
          '#b21e35',
          '#bd1f36',
          '#c71f37',
          '#da1e37',
          '#e01e37'
        ],
        keywords: ['red', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ffedd8',
          '#f3d5b5',
          '#e7bc91',
          '#d4a276',
          '#bc8a5f',
          '#a47148',
          '#8b5e34',
          '#6f4518',
          '#603808',
          '#583101'
        ],
        keywords: ['warm', 'brown', 'gradient', 'monochromatic']
      },

      {
        colors: [
          '#ffe169',
          '#fad643',
          '#edc531',
          '#dbb42c',
          '#c9a227',
          '#b69121',
          '#a47e1b',
          '#926c15',
          '#805b10',
          '#76520e'
        ],
        keywords: ['warm', 'yellow', 'brown', 'gradient', 'monochromatic']
      },

      {
        colors: ['#ffe0e9', '#ffc2d4', '#ff9ebb', '#ff7aa2', '#e05780', '#b9375e', '#8a2846', '#602437', '#522e38'],
        keywords: ['warm', 'pink', 'gradient', 'monochromatic']
      },

      {
        colors: [
          '#10451d',
          '#155d27',
          '#1a7431',
          '#208b3a',
          '#25a244',
          '#2dc653',
          '#4ad66d',
          '#6ede8a',
          '#92e6a7',
          '#b7efc5'
        ],
        keywords: ['green', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#352208', '#e1bb80', '#7b6b43', '#685634', '#806443'],
        keywords: ['brown', 'warm', 'monochromatic']
      },
      {
        colors: ['#aaaaaa', '#bbbbbb', '#cccccc', '#dddddd', '#eeeeee'],
        keywords: ['gray', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#b9d6f2', '#061a40', '#0353a4', '#006daa', '#003559'],
        keywords: ['cold', 'blue', 'gradient', 'monochromatic']
      },
      {
        colors: ['#c52233', '#a51c30', '#a7333f', '#74121d', '#580c1f'],
        keywords: ['red', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#f9dc5c', '#fae588', '#fcefb4', '#fdf8e1', '#f9dc5c'],
        keywords: ['yellow', 'warm', 'pastel', 'monochromatic']
      },
      {
        colors: ['#3e92cc', '#2a628f', '#13293d', '#16324f', '#18435a'],
        keywords: ['blue', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#fffae5',
          '#fff6cc',
          '#fff2b2',
          '#ffee99',
          '#ffe97f',
          '#ffe566',
          '#ffe14c',
          '#ffdd32',
          '#ffd819',
          '#ffd400'
        ],
        keywords: ['warm', 'yellow', 'gradient', 'monochromatic']
      },
      {
        colors: ['#410b13', '#cd5d67', '#ba1f33', '#421820', '#91171f'],
        keywords: ['warm', 'red', 'monochromatic']
      },
      {
        colors: [
          '#774936',
          '#6e4230',
          '#653a2a',
          '#5c3324',
          '#532c1e',
          '#4a2419',
          '#411d13',
          '#38160d',
          '#2f0e07',
          '#260701'
        ],
        keywords: ['brown', 'dark', 'gradient', 'monochromatic']
      },

      {
        colors: [
          '#00111c',
          '#001523',
          '#001a2c',
          '#002137',
          '#00253e',
          '#002945',
          '#002e4e',
          '#003356',
          '#003a61',
          '#00406c'
        ],
        keywords: ['cold', 'dark', 'blue', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ffdcc2',
          '#ffd1ad',
          '#ffc599',
          '#eda268',
          '#da7e37',
          '#c06722',
          '#a85311',
          '#8f3e00',
          '#713200',
          '#522500'
        ],
        keywords: ['warm', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#00487c', '#4bb3fd', '#3e6680', '#0496ff', '#027bce'],
        keywords: ['blue', 'cold', 'monochromatic']
      },
      {
        colors: [
          '#9c191b',
          '#ac1c1e',
          '#bd1f21',
          '#d02224',
          '#dd2c2f',
          '#e35053',
          '#e66063',
          '#ec8385',
          '#f1a7a9',
          '#f6cacc'
        ],
        keywords: ['red', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#f8f9fb', '#e1ecf7', '#aecbeb', '#83b0e1', '#71a5de'],
        keywords: ['gray', 'cold', 'pastel', 'blue', 'gradient', 'monochromatic']
      },
      {
        colors: ['#a48971', '#8d6b48', '#9a774f', '#a9845a', '#be986d', '#d2a87d', '#e8c9ab', '#f5d7bd'],
        keywords: ['brown', 'warm', 'vintage', 'gradient', 'monochromatic']
      },
      {
        colors: ['#9dd9d2', '#79bcb8', '#5ec2b7', '#2ca6a4', '#3aa7a3'],
        keywords: ['turquoise', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#e9f5db',
          '#dcebca',
          '#cfe1b9',
          '#c2d5aa',
          '#b5c99a',
          '#a6b98b',
          '#97a97c',
          '#849669',
          '#728359',
          '#606f49'
        ],
        keywords: ['cold', 'vintage', 'green', 'gradient', 'monochromatic']
      },

      {
        colors: [
          '#310055',
          '#3c0663',
          '#4a0a77',
          '#5a108f',
          '#6818a5',
          '#8b2fc9',
          '#ab51e3',
          '#bd68ee',
          '#d283ff',
          '#dc97ff'
        ],
        keywords: ['violet', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#424342', '#244f26', '#256d1b', '#149911', '#1efc1e'],
        keywords: ['cold', 'green', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ffffb7',
          '#fff8a5',
          '#fff599',
          '#fff185',
          '#ffee70',
          '#ffec5c',
          '#ffe747',
          '#ffe433',
          '#ffdd1f',
          '#ffda0a'
        ],
        keywords: ['warm', 'yellow', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#e5d4c3',
          '#e5c9ae',
          '#debea2',
          '#d6ab7d',
          '#b3895d',
          '#9b744a',
          '#81583a',
          '#734f38',
          '#553725',
          '#482919'
        ],
        keywords: ['warm', 'brown', 'gradient', 'monochromatic']
      },

      {
        colors: ['#2b0000', '#4f0000', '#740000', '#980000', '#b50000', '#d30000', '#eb1d1d', '#f50f0f', '#ff0000'],
        keywords: ['red', 'gradient', 'monochromatic']
      },

      {
        colors: ['#d6ccc2', '#ded6ce', '#e5ded8', '#eeeae6', '#e3d5ca', '#f5ebe0'],
        keywords: ['gray', 'warm', 'pastel', 'vintage', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#643100',
          '#763a00',
          '#7f3e00',
          '#914600',
          '#af5500',
          '#b96619',
          '#c27731',
          '#cb8849',
          '#d49961',
          '#eacaae'
        ],
        keywords: ['brown', 'warm', 'orange', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#0f3375',
          '#13459c',
          '#1557c0',
          '#196bde',
          '#2382f7',
          '#4b9cf9',
          '#77b6fb',
          '#a4cefc',
          '#cce4fd',
          '#e8f3fe'
        ],
        keywords: ['blue', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#3a015c', '#32004f', '#220135', '#190028', '#11001c'],
        keywords: ['violet', 'cold', 'dark', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ffe169',
          '#fad643',
          '#edc531',
          '#dbb42c',
          '#c9a227',
          '#b69121',
          '#a47e1b',
          '#926c15',
          '#805b10',
          '#6e4c0d'
        ],
        keywords: ['warm', 'yellow', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#ede0d4', '#e6ccb2', '#ddb892', '#b08968', '#9c6644', '#7f5539'],
        keywords: ['warm', 'vintage', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#daf2d7', '#e4fde1', '#c6edc3', '#a7dca5', '#90cf8e'],
        keywords: ['cold', 'pastel', 'green', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#7400b8',
          '#8013bd',
          '#8b26c3',
          '#9739c8',
          '#a24ccd',
          '#ae60d3',
          '#b973d8',
          '#c586dd',
          '#d099e3',
          '#dcace8'
        ],
        keywords: ['violet', 'cold', 'pink', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#fff7d1',
          '#fffceb',
          '#fff3b7',
          '#ffee9d',
          '#ffea83',
          '#ffe568',
          '#ffe14e',
          '#ffdc34',
          '#ffd81a',
          '#ffd300'
        ],
        keywords: ['warm', 'yellow', 'gradient', 'monochromatic']
      },
      {
        colors: ['#eef6fc', '#cbe5f6', '#97caed', '#63b0e3', '#3498db', '#2280bf', '#185d8b', '#0f3a57'],
        keywords: ['cold', 'blue', 'gradient', 'monochromatic']
      },

      {
        colors: ['#b9375e', '#e05780', '#ff7aa2', '#ff9ebb', '#ffc2d4', '#ffe0e9'],
        keywords: ['pink', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#5f5449', '#9b8269', '#afa193', '#ddd4cc', '#fcf3ea'],
        keywords: ['brown', 'warm', 'gray', 'gradient', 'monochromatic']
      },
      {
        colors: ['#fc9ca2', '#fb747d', '#fa4c58', '#f92432', '#e30613', '#c70512', '#9f040e', '#77030b', '#500207'],
        keywords: ['red', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#e1d8f7', '#d7c8f3', '#d0bef2', '#c0a7eb', '#b596e5'],
        keywords: ['cold', 'pastel', 'violet', 'gradient', 'monochromatic']
      },
      {
        colors: ['#00132d', '#00193b', '#001e45', '#002657', '#002d67', '#00377e'],
        keywords: ['cold', 'dark', 'blue', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#36241c',
          '#422c22',
          '#4d3328',
          '#644234',
          '#815f51',
          '#aa8b7e',
          '#d3b6ab',
          '#e6d5ce',
          '#f0e5e1',
          '#f9f5f3'
        ],
        keywords: ['brown', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#f8f0e5', '#956b4b', '#e2c7aa', '#8f857b', '#b19a81'],
        keywords: ['warm', 'vintage', 'brown', 'monochromatic']
      },
      {
        colors: ['#780000', '#660000', '#520000', '#3d0000', '#290000'],
        keywords: ['red', 'dark', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ff0072',
          '#ff177f',
          '#ff2e8c',
          '#ff4598',
          '#ff5ca5',
          '#ff74b2',
          '#ff8bbf',
          '#ffa2cb',
          '#ffb9d8',
          '#ffd0e5'
        ],
        keywords: ['pink', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#cba48b',
          '#d4af96',
          '#dcb9a1',
          '#e4c3af',
          '#ebcfbc',
          '#846552',
          '#8f705b',
          '#997a66',
          '#a48470',
          '#ae8f7a'
        ],
        keywords: ['warm', 'vintage', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#20331a',
          '#33512a',
          '#446c37',
          '#558745',
          '#66a253',
          '#7cb36b',
          '#94c186',
          '#abcea1',
          '#c3dcbc',
          '#dbead7'
        ],
        keywords: ['cold', 'green', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#e9f5db',
          '#cfe1b9',
          '#b5c99a',
          '#97a97c',
          '#87986a',
          '#718355',
          '#8d9c77',
          '#a4b092',
          '#b6c0a8',
          '#c5cdb9'
        ],
        keywords: ['cold', 'vintage', 'green', 'gradient', 'monochromatic']
      },
      {
        colors: ['#dec09a', '#fff0cf', '#eed7a3', '#d8cba8', '#d9b285', '#f0dcc5', '#dcc5a0', '#d9af82', '#dcc5a0'],
        keywords: ['warm', 'pastel', 'vintage', 'gradient', 'monochromatic']
      },
      {
        colors: ['#ffe169', '#edc531', '#c9a227', '#a47e1b', '#805b10'],
        keywords: ['warm', 'yellow', 'brown', 'gradient', 'monochromatic']
      },
      {
        colors: ['#064789', '#427aa1', '#ebf2fa'],
        keywords: ['blue', 'cold', 'gradient', 'monochromatic']
      },
      {
        colors: ['#9381ff', '#b8b8ff', '#f8f7ff'],
        keywords: ['blue', 'cold', 'pastel', 'gradient', 'monochromatic']
      },
      {
        colors: ['#e7decd', '#efe8db', '#f4efe6', '#faf7f0', '#fbfaf8'],
        keywords: ['warm', 'pastel', 'vintage', 'gray', 'gradient', 'monochromatic']
      },
      {
        colors: ['#0a2d27', '#13594e', '#1d8676', '#26b29d', '#30dfc4', '#59e5d0', '#83ecdc', '#acf2e7', '#d6f9f3'],
        keywords: ['cold', 'turquoise', 'gradient', 'monochromatic']
      },
      {
        colors: [
          '#ffd400',
          '#ffd819',
          '#ffdd32',
          '#ffe14c',
          '#ffe566',
          '#ffe97f',
          '#ffee99',
          '#fff2b2',
          '#fff6cc',
          '#fffae5'
        ],
        keywords: ['yellow', 'warm', 'gradient', 'monochromatic']
      },
      {
        colors: ['#001d52', '#002c66', '#00397a', '#01458d', '#024fa1', '#045cb4', '#0466c8', '#0470dc', '#057af0'],
        keywords: ['blue', 'cold', 'gradient', 'monochromatic']
      },

      {
        colors: [
          '#000e14',
          '#00111a',
          '#00141f',
          '#001824',
          '#001b29',
          '#002233',
          '#00293d',
          '#003047',
          '#003652',
          '#003d5c'
        ],
        keywords: ['dark', 'blue', 'gradient', 'monochromatic']
      },
    ]
  },
  {
    label: 'Sequential (Multi Hue)',
    colors: [
      {
        colors: [
          '#d9ed92',
          '#b5e48c',
          '#99d98c',
          '#76c893',
          '#52b69a',
          '#34a0a4',
          '#168aad',
          '#1a759f',
          '#1e6091',
          '#184e77'
        ]
      },
      {
        colors: [
          '#fec5bb',
          '#fcd5ce',
          '#fae1dd',
          '#f8edeb',
          '#e8e8e4',
          '#d8e2dc',
          '#ece4db',
          '#ffe5d9',
          '#ffd7ba',
          '#fec89a'
        ],
        keywords: ['pastel', 'gray', 'gradient']
      },
      {
        colors: [
          '#03071e',
          '#370617',
          '#6a040f',
          '#9d0208',
          '#d00000',
          '#dc2f02',
          '#e85d04',
          '#f48c06',
          '#faa307',
          '#ffba08'
        ],
        keywords: ['red', 'orange', 'gradient']
      },
      {
        colors: [
          '#f72585',
          '#b5179e',
          '#7209b7',
          '#560bad',
          '#480ca8',
          '#3a0ca3',
          '#3f37c9',
          '#4361ee',
          '#4895ef',
          '#4cc9f0'
        ],
        keywords: ['cold', 'violet', 'blue', 'gradient']
      },
      {
        colors: [
          '#001219',
          '#005f73',
          '#0a9396',
          '#94d2bd',
          '#e9d8a6',
          '#ee9b00',
          '#ca6702',
          '#bb3e03',
          '#ae2012',
          '#9b2226'
        ],
        keywords: ['gradient']
      },
      {
        colors: [
          '#7400b8',
          '#6930c3',
          '#5e60ce',
          '#5390d9',
          '#4ea8de',
          '#48bfe3',
          '#56cfe1',
          '#64dfdf',
          '#72efdd',
          '#80ffdb'
        ],
        keywords: ['cold', 'blue', 'turquoise', 'gradient']
      },
      {
        colors: [
          '#f94144',
          '#f3722c',
          '#f8961e',
          '#f9844a',
          '#f9c74f',
          '#90be6d',
          '#43aa8b',
          '#4d908e',
          '#577590',
          '#277da1'
        ],
        keywords: ['orange', 'gradient']
      },
      {
        colors: [
          '#d9ed92',
          '#b5e48c',
          '#99d98c',
          '#76c893',
          '#52b69a',
          '#34a0a4',
          '#168aad',
          '#1a759f',
          '#1e6091',
          '#184e77'
        ],
        keywords: ['green', 'blue', 'gradient']
      },
      {
        colors: [
          '#ffcbf2',
          '#f3c4fb',
          '#ecbcfd',
          '#e5b3fe',
          '#e2afff',
          '#deaaff',
          '#d8bbff',
          '#d0d1ff',
          '#c8e7ff',
          '#c0fdff'
        ],
        keywords: ['cold', 'pastel', 'violet', 'gradient']
      },
      {
        colors: [
          '#007f5f',
          '#2b9348',
          '#55a630',
          '#80b918',
          '#aacc00',
          '#bfd200',
          '#d4d700',
          '#dddf00',
          '#eeef20',
          '#ffff3f'
        ],
        keywords: ['green', 'yellow', 'gradient']
      },
      {
        colors: [
          '#0b090a',
          '#161a1d',
          '#660708',
          '#a4161a',
          '#ba181b',
          '#e5383b',
          '#b1a7a6',
          '#d3d3d3',
          '#f5f3f4',
          '#ffffff'
        ],
        keywords: ['red', 'gray', 'gradient']
      },
      {
        colors: [
          '#582f0e',
          '#7f4f24',
          '#936639',
          '#a68a64',
          '#b6ad90',
          '#c2c5aa',
          '#a4ac86',
          '#656d4a',
          '#414833',
          '#333d29'
        ],
        keywords: ['brown', 'green', 'gradient']
      },
      {
        colors: [
          '#012a4a',
          '#013a63',
          '#01497c',
          '#014f86',
          '#2a6f97',
          '#2c7da0',
          '#468faf',
          '#61a5c2',
          '#89c2d9',
          '#a9d6e5'
        ],
        keywords: ['blue', 'cold', 'gradient']
      },
      {
        colors: [
          '#0466c8',
          '#0353a4',
          '#023e7d',
          '#002855',
          '#001845',
          '#001233',
          '#33415c',
          '#5c677d',
          '#7d8597',
          '#979dac'
        ],
        keywords: ['blue', 'cold', 'gradient']
      },
      {
        colors: [
          '#006466',
          '#065a60',
          '#0b525b',
          '#144552',
          '#1b3a4b',
          '#212f45',
          '#272640',
          '#312244',
          '#3e1f47',
          '#4d194d'
        ],
        keywords: ['cold', 'dark', 'gradient']
      },
      {
        colors: [
          '#fbf8cc',
          '#fde4cf',
          '#ffcfd2',
          '#f1c0e8',
          '#cfbaf0',
          '#a3c4f3',
          '#90dbf4',
          '#8eecf5',
          '#98f5e1',
          '#b9fbc0'
        ],
        keywords: ['pastel', 'gradient']
      },
      {
        colors: [
          '#ff7b00',
          '#ff8800',
          '#ff9500',
          '#ffa200',
          '#ffaa00',
          '#ffb700',
          '#ffc300',
          '#ffd000',
          '#ffdd00',
          '#ffea00'
        ],
        keywords: ['orange', 'warm', 'bright', 'yellow', 'gradient']
      },
      {
        colors: [
          '#ff6d00',
          '#ff7900',
          '#ff8500',
          '#ff9100',
          '#ff9e00',
          '#240046',
          '#3c096c',
          '#5a189a',
          '#7b2cbf',
          '#9d4edd'
        ],
        keywords: ['orange', 'violet', 'gradient']
      },
      {
        colors: [
          '#2d00f7',
          '#6a00f4',
          '#8900f2',
          '#a100f2',
          '#b100e8',
          '#bc00dd',
          '#d100d1',
          '#db00b6',
          '#e500a4',
          '#f20089'
        ],
        keywords: ['violet', 'cold', 'bright', 'pink', 'gradient']
      },
      {
        colors: [
          '#eddcd2',
          '#fff1e6',
          '#fde2e4',
          '#fad2e1',
          '#c5dedd',
          '#dbe7e4',
          '#f0efeb',
          '#d6e2e9',
          '#bcd4e6',
          '#99c1de'
        ],
        keywords: ['pastel', 'gradient']
      },
      {
        colors: [
          '#e2e2df',
          '#d2d2cf',
          '#e2cfc4',
          '#f7d9c4',
          '#faedcb',
          '#c9e4de',
          '#c6def1',
          '#dbcdf0',
          '#f2c6de',
          '#f9c6c9'
        ],
        keywords: ['pastel', 'gradient']
      },
      {
        colors: [
          '#ff4800',
          '#ff5400',
          '#ff6000',
          '#ff6d00',
          '#ff7900',
          '#ff8500',
          '#ff9100',
          '#ff9e00',
          '#ffaa00',
          '#ffb600'
        ],
        keywords: ['orange', 'warm', 'bright', 'gradient']
      },
      {
        colors: [
          '#797d62',
          '#9b9b7a',
          '#baa587',
          '#d9ae94',
          '#f1dca7',
          '#ffcb69',
          '#e8ac65',
          '#d08c60',
          '#b58463',
          '#997b66'
        ],
        keywords: ['warm', 'vintage', 'gradient']
      },
      {
        colors: [
          '#99e2b4',
          '#88d4ab',
          '#78c6a3',
          '#67b99a',
          '#56ab91',
          '#469d89',
          '#358f80',
          '#248277',
          '#14746f',
          '#036666'
        ],
        keywords: ['green', 'cold', 'turquoise', 'gradient']
      },
      {
        colors: [
          '#54478c',
          '#2c699a',
          '#048ba8',
          '#0db39e',
          '#16db93',
          '#83e377',
          '#b9e769',
          '#efea5a',
          '#f1c453',
          '#f29e4c'
        ],
        keywords: ['gradient']
      },
      {
        colors: [
          '#757bc8',
          '#8187dc',
          '#8e94f2',
          '#9fa0ff',
          '#ada7ff',
          '#bbadff',
          '#cbb2fe',
          '#dab6fc',
          '#ddbdfc',
          '#e0c3fc'
        ],
        keywords: ['blue', 'cold', 'violet', 'gradient']
      },
      {
        colors: [
          '#dec9e9',
          '#dac3e8',
          '#d2b7e5',
          '#c19ee0',
          '#b185db',
          '#a06cd5',
          '#9163cb',
          '#815ac0',
          '#7251b5',
          '#6247aa'
        ],
        keywords: ['cold', 'violet', 'gradient']
      },
      {
        colors: [
          '#ea698b',
          '#d55d92',
          '#c05299',
          '#ac46a1',
          '#973aa8',
          '#822faf',
          '#6d23b6',
          '#6411ad',
          '#571089',
          '#47126b'
        ],
        keywords: ['pink', 'violet', 'gradient']
      },
      {
        colors: [
          '#ff0000',
          '#ff8700',
          '#ffd300',
          '#deff0a',
          '#a1ff0a',
          '#0aff99',
          '#0aefff',
          '#147df5',
          '#580aff',
          '#be0aff'
        ],
        keywords: ['bright']
      },
      {
        colors: [
          '#e8a598',
          '#ffb5a7',
          '#fec5bb',
          '#fcd5ce',
          '#fae1dd',
          '#f8edeb',
          '#f9e5d8',
          '#f9dcc4',
          '#fcd2af',
          '#fec89a'
        ],
        keywords: ['warm', 'pastel', 'gradient']
      },
      {
        colors: [
          '#e3f2fd',
          '#bbdefb',
          '#90caf9',
          '#64b5f6',
          '#42a5f5',
          '#2196f3',
          '#1e88e5',
          '#1976d2',
          '#1565c0',
          '#0d47a1'
        ],
        keywords: ['cold', 'blue', 'gradient']
      },
      {
        colors: [
          '#b76935',
          '#a56336',
          '#935e38',
          '#815839',
          '#6f523b',
          '#5c4d3c',
          '#4a473e',
          '#38413f',
          '#263c41',
          '#143642'
        ],
        keywords: ['brown', 'gradient']
      },
      {
        colors: [
          '#ff5400',
          '#ff6d00',
          '#ff8500',
          '#ff9100',
          '#ff9e00',
          '#00b4d8',
          '#0096c7',
          '#0077b6',
          '#023e8a',
          '#03045e'
        ],
        keywords: ['orange', 'blue', 'gradient']
      },
      {
        colors: [
          '#3fc1c0',
          '#20bac5',
          '#00b2ca',
          '#04a6c2',
          '#0899ba',
          '#0f80aa',
          '#16679a',
          '#1a5b92',
          '#1c558e',
          '#1d4e89'
        ],
        keywords: ['turquoise', 'cold', 'blue', 'gradient']
      },
      {
        colors: [
          '#fff75e',
          '#fff056',
          '#ffe94e',
          '#ffe246',
          '#ffda3d',
          '#ffd53e',
          '#fecf3e',
          '#fdc43f',
          '#fdbe39',
          '#fdb833'
        ],
        keywords: ['yellow', 'warm', 'orange', 'gradient']
      },
      {
        colors: [
          '#e574bc',
          '#ea84c9',
          '#ef94d5',
          '#f9b4ed',
          '#eabaf6',
          '#dabfff',
          '#c4c7ff',
          '#adcfff',
          '#96d7ff',
          '#7fdeff'
        ],
        keywords: ['pink', 'cold', 'pastel', 'blue', 'gradient']
      },
      {
        colors: [
          '#053c5e',
          '#1d3958',
          '#353652',
          '#4c334d',
          '#643047',
          '#7c2e41',
          '#942b3b',
          '#ab2836',
          '#c32530',
          '#db222a'
        ],
        keywords: ['red', 'gradient']
      },
      {
        colors: [
          '#033270',
          '#1368aa',
          '#4091c9',
          '#9dcee2',
          '#fedfd4',
          '#f29479',
          '#f26a4f',
          '#ef3c2d',
          '#cb1b16',
          '#65010c'
        ],
        keywords: ['blue', 'red', 'gradient']
      },
      {
        colors: [
          '#ccd5ae',
          '#dbe1bc',
          '#e9edc9',
          '#f4f4d5',
          '#fefae0',
          '#fcf4d7',
          '#faedcd',
          '#e7c8a0',
          '#deb68a',
          '#d4a373'
        ],
        keywords: ['warm', 'pastel', 'vintage', 'gradient']
      },
      {
        colors: [
          '#5c0000',
          '#751717',
          '#ba0c0c',
          '#ff0000',
          '#ffebeb',
          '#ecffeb',
          '#27a300',
          '#2a850e',
          '#2d661b',
          '#005c00'
        ],
        keywords: ['red', 'green', 'gradient']
      },
      {
        colors: [
          '#8ecae6',
          '#73bfdc',
          '#58b4d1',
          '#219ebc',
          '#126782',
          '#023047',
          '#ffb703',
          '#fd9e02',
          '#fb8500',
          '#fb9017'
        ],
        keywords: ['blue', 'orange', 'gradient']
      },
      {
        colors: [
          '#97dffc',
          '#93caf6',
          '#8eb5f0',
          '#858ae3',
          '#7364d2',
          '#613dc1',
          '#5829a7',
          '#4e148c',
          '#461177',
          '#3d0e61'
        ],
        keywords: ['blue', 'cold', 'violet', 'gradient']
      },
      {
        colors: [
          '#baebff',
          '#bbdbfe',
          '#bccbfd',
          '#bebcfc',
          '#bfacfb',
          '#c09cfa',
          '#c18cf9',
          '#c37df8',
          '#c46df7',
          '#c55df6'
        ],
        keywords: ['blue', 'cold', 'pastel', 'violet', 'gradient']
      },
      {
        colors: [
          '#004733',
          '#2b6a4d',
          '#568d66',
          '#a5c1ae',
          '#f3f4f6',
          '#dcdfe5',
          '#df8080',
          '#cb0b0a',
          '#ad080f',
          '#8e0413'
        ],
        keywords: ['red', 'gradient']
      },
      {
        colors: [
          '#532a09',
          '#7b4618',
          '#915c27',
          '#ad8042',
          '#bfab67',
          '#bfc882',
          '#a4b75c',
          '#647332',
          '#3e4c22',
          '#2e401c'
        ],
        keywords: ['brown', 'green', 'gradient']
      },
      {
        colors: [
          '#fcac5d',
          '#fcb75d',
          '#fcbc5d',
          '#fcc75d',
          '#fccc5d',
          '#fcd45d',
          '#fcdc5d',
          '#fce45d',
          '#fcec5d',
          '#fcf45d'
        ],
        keywords: ['orange', 'warm', 'pastel', 'yellow', 'gradient']
      },
      {
        colors: [
          '#fff200',
          '#ffe600',
          '#ffd900',
          '#ffcc00',
          '#ffbf00',
          '#ffb300',
          '#ffa600',
          '#ff9900',
          '#ff8c00',
          '#ff8000'
        ],
        keywords: ['yellow', 'warm', 'bright', 'orange', 'gradient']
      },
      {
        colors: [
          '#669900',
          '#99cc33',
          '#ccee66',
          '#006699',
          '#3399cc',
          '#990066',
          '#cc3399',
          '#ff6600',
          '#ff9900',
          '#ffcc00'
        ],
        keywords: ['gradient']
      },
      {
        colors: [
          '#23233b',
          '#2c4268',
          '#007bba',
          '#00a9e2',
          '#7ccdf4',
          '#bce3fa',
          '#9b9c9b',
          '#b2b0b0',
          '#c5c6c6',
          '#ebebeb'
        ],
        keywords: ['blue', 'gray', 'gradient']
      },
      {
        colors: [
          '#ffb950',
          '#ffad33',
          '#ff931f',
          '#ff7e33',
          '#fa5e1f',
          '#ec3f13',
          '#b81702',
          '#a50104',
          '#8e0103',
          '#7a0103'
        ],
        keywords: ['orange', 'warm', 'red', 'gradient']
      },
      {
        colors: [
          '#eb5e28',
          '#f27f34',
          '#f9a03f',
          '#f6b049',
          '#f3c053',
          '#a1c349',
          '#94b33d',
          '#87a330',
          '#799431',
          '#6a8532'
        ],
        keywords: ['orange', 'warm', 'green', 'gradient']
      },
      {
        colors: [
          '#a1ef7a',
          '#b0ef8e',
          '#baf19c',
          '#d0f4ba',
          '#eaf8da',
          '#dce9fc',
          '#bbdef9',
          '#9cd2f7',
          '#89ccf6',
          '#78c6f7'
        ],
        keywords: ['green', 'cold', 'pastel', 'blue', 'gradient']
      },
      {
        colors: [
          '#a564d3',
          '#b66ee8',
          '#c879ff',
          '#d689ff',
          '#e498ff',
          '#f2a8ff',
          '#ffb7ff',
          '#ffc4ff',
          '#ffc9ff',
          '#ffceff'
        ],
        keywords: ['violet', 'cold', 'pastel', 'pink', 'gradient']
      },
      {
        colors: [
          '#0377a8',
          '#118fb0',
          '#1fa6b8',
          '#2fb5c7',
          '#3ec4d6',
          '#51ccd1',
          '#63d4cc',
          '#8be8d7',
          '#a0f1da',
          '#b4fadc'
        ],
        keywords: ['cold', 'turquoise', 'gradient']
      },
      {
        colors: [
          '#e6f2ff',
          '#ccdcff',
          '#b3beff',
          '#9a99f2',
          '#8b79d9',
          '#805ebf',
          '#6f46a6',
          '#60308c',
          '#511f73',
          '#431259'
        ],
        keywords: ['cold', 'violet', 'gradient']
      },
      {
        colors: [
          '#ffe863',
          '#ffe150',
          '#ffd93d',
          '#facb2e',
          '#f5bd1f',
          '#722e9a',
          '#682a92',
          '#5d2689',
          '#522882',
          '#47297b'
        ],
        keywords: ['yellow', 'violet', 'gradient']
      },
      {
        colors: [
          '#4a006f',
          '#470a77',
          '#45147e',
          '#421e86',
          '#3f288d',
          '#3d3195',
          '#3a3b9c',
          '#3745a4',
          '#354fab',
          '#3259b3'
        ],
        keywords: ['violet', 'cold', 'blue', 'gradient']
      },
      {
        colors: [
          '#0466c8',
          '#0353a4',
          '#023e7d',
          '#002855',
          '#001845',
          '#001233',
          '#38b000',
          '#70e000',
          '#9ef01a',
          '#ccff33'
        ],
        keywords: ['blue', 'green', 'gradient']
      },
      {
        colors: [
          '#421869',
          '#491a74',
          '#721cb8',
          '#995bd5',
          '#bf99f2',
          '#9cf945',
          '#8edf34',
          '#80c423',
          '#509724',
          '#1f6924'
        ],
        keywords: ['cold', 'violet', 'green', 'gradient']
      },
      {
        colors: [
          '#0450b4',
          '#046dc8',
          '#1184a7',
          '#15a2a2',
          '#6fb1a0',
          '#b4418e',
          '#d94a8c',
          '#ea515f',
          '#fe7434',
          '#fea802'
        ],
        keywords: []
      },
      {
        colors: [
          '#00193a',
          '#002b53',
          '#023f73',
          '#034780',
          '#7a0213',
          '#a10220',
          '#bf0a26',
          '#cd0c2b',
          '#131313',
          '#262626'
        ],
        keywords: ['blue', 'red', 'gradient']
      },
      {
        colors: [
          '#072ac8',
          '#1360e2',
          '#1e96fc',
          '#60b6fb',
          '#a2d6f9',
          '#cfe57d',
          '#fcf300',
          '#fedd00',
          '#ffc600',
          '#ffcb17'
        ],
        keywords: ['blue', 'yellow', 'gradient']
      },
      {
        colors: [
          '#461873',
          '#58148e',
          '#6910a8',
          '#8c07dd',
          '#9f21e3',
          '#b333e9',
          '#cb5df1',
          '#dc93f6',
          '#eabffa',
          '#f7ebfd'
        ],
        keywords: ['violet', 'cold', 'pink', 'gradient']
      },
      {
        colors: [
          '#e4a5ff',
          '#deabff',
          '#d8b1ff',
          '#d1b7ff',
          '#cbbdff',
          '#c5c4ff',
          '#bfcaff',
          '#b8d0ff',
          '#b2d6ff',
          '#acdcff'
        ],
        keywords: ['cold', 'pastel', 'violet', 'blue', 'gradient']
      },
      {
        colors: [
          '#0c3e5e',
          '#155b87',
          '#2d92d1',
          '#74bbe8',
          '#97d1f4',
          '#0c5e50',
          '#158774',
          '#2ed1b5',
          '#74e8d4',
          '#97f4e5'
        ],
        keywords: ['blue', 'cold', 'turquoise', 'gradient']
      },
      {
        colors: [
          '#c200fb',
          '#d704b2',
          '#e2068d',
          '#ec0868',
          '#f41c34',
          '#fc2f00',
          '#f45608',
          '#ec7d10',
          '#f69d0d',
          '#ffbc0a'
        ],
        keywords: ['pink', 'bright', 'orange', 'gradient']
      },
      {
        colors: [
          '#62040a',
          '#9d0610',
          '#d90816',
          '#f72634',
          '#f9626c',
          '#bd4ef9',
          '#a713f6',
          '#8207c5',
          '#5b058a',
          '#35034f'
        ],
        keywords: ['red', 'violet', 'gradient']
      },
      {
        colors: [
          '#39d05c',
          '#35e95f',
          '#35d475',
          '#35ac7a',
          '#347f83',
          '#2e518a',
          '#40288f',
          '#5702a1',
          '#6500a3',
          '#8127b9'
        ],
        keywords: ['green', 'cold', 'violet', 'gradient']
      },
      {
        colors: [
          '#014737',
          '#03543f',
          '#046c4e',
          '#057a55',
          '#0e9f6e',
          '#31c48d',
          '#84e1bc',
          '#bcf0da',
          '#def7ec',
          '#f3faf7'
        ],
        keywords: ['turquoise', 'cold', 'green', 'gradient']
      },
      {
        colors: [
          '#2b2d42',
          '#4e2c70',
          '#702b9e',
          '#b429f9',
          '#9c43f8',
          '#855df7',
          '#6d77f6',
          '#5591f5',
          '#3eabf4',
          '#26c5f3'
        ],
        keywords: ['cold', 'violet', 'blue', 'gradient']
      },
      {
        colors: [
          '#f0d7df',
          '#f9e0e2',
          '#f8eaec',
          '#f7ddd9',
          '#f7e6da',
          '#e3e9dd',
          '#c4dbd9',
          '#d4e5e3',
          '#cae0e4',
          '#c8c7d6'
        ],
        keywords: ['pastel', 'gray', 'gradient']
      },
      {
        colors: [
          '#73b7b8',
          '#52a1a3',
          '#76c8b1',
          '#50b99b',
          '#dc244b',
          '#af1d3c',
          '#f6cb52',
          '#f3b816',
          '#f05a29',
          '#d23f0f'
        ],
        keywords: ['turquoise', 'red', 'gradient']
      },
      {
        colors: [
          '#f56a00',
          '#fa8b01',
          '#ffad03',
          '#ffc243',
          '#ffcf70',
          '#cea7ee',
          '#b67be6',
          '#9d4edd',
          '#72369d',
          '#461e5c'
        ],
        keywords: ['orange', 'violet', 'gradient']
      },
      {
        colors: [
          '#ff61ab',
          '#ff6176',
          '#ff8161',
          '#ffb561',
          '#ffea62',
          '#dfff61',
          '#abff61',
          '#76ff61',
          '#61ff81',
          '#61ffb5'
        ],
        keywords: ['pastel', 'green', 'gradient']
      },
      {
        colors: [
          '#797d62',
          '#9b9b7a',
          '#baa587',
          '#d9ae94',
          '#aeb0a4',
          '#dbdbd5',
          '#e8ac65',
          '#d08c60',
          '#b58463',
          '#997b66'
        ],
        keywords: ['warm', 'vintage', 'gradient']
      },
      {
        colors: [
          '#336699',
          '#5c98c0',
          '#70b1d4',
          '#84cae7',
          '#a1e1cf',
          '#bdf7b7',
          '#8ee3a7',
          '#5fcf97',
          '#30bb87',
          '#00a676'
        ],
        keywords: ['blue', 'cold', 'green', 'gradient']
      }
    ]
  }
]
