import unittest
import sys
from gooey_server.palette_generator.palette_generator import palette_generator
from gooey_server.palette_generator.color_library import color_library

"""
Test for the generator.
"""
class TestPaletteGenerator(unittest.TestCase):

    def setUp(self):
        self.gen = palette_generator()
        self.lib = color_library()

        ##### some input liked colors ####
        self.autumn = ['#e16865', '#e2725b', '#de6360', '#d05f04', '#a72525', '#b32d29', '#b43332', '#8d3f3f', '#ffe772', '#ffefa1', '#dfbe6f', '#e1bc64', '#604913', '#c39953', '#cabb48', '#cfb53b', '#b98d28', '#ba7f03', '#dcb20c', '#3a6a47', '#396413', '#5fa777', '#587156', '#5d5e37', '#a8989b', '#a86515', '#ab917a', '#ad781b', '#a9a491', '#af593e', '#885342', '#86949f', '#8a3324', '#877c7b', '#f5edef', '#ffe4cd', '#4d3d14']
        
        self.neon = ['#ff496c', '#ff5349', '#ff2b2b', '#da2647', '#ff4040', '#cd4a4c', '#ff2400', '#fefe22', '#fdff00', '#fff44f', '#ffdb00', '#45cea2', '#00a693', '#c5e384', '#007fff', '#00ffff', '#1dacd6', '#1fc2c2', '#9c51b6', '#df73ff', '#db91ef', '#8b00ff']
        
        self.underwater = ['#f4c430', '#f0d52d', '#ecf245', '#e16865', '#de6360', '#e2725b', '#1b659d', '#1959a8', '#1450aa', '#0f2d9e', '#08e8de', '#18a7b5', '#036a6e', '#00cccc', '#00ffff', '#1ca9c9', '#003399', '#0056a7', '#002387', '#1f75fe', '#1974d2', '#002fa7', '#2596d1', '#202e54', '#251f4f', '#4169e1', '#3b91b4']


        #### some liked palettes ###
        self.monochrome = [['#fae0b5', '#e09f3e'], ['#9e2a2b', '#540b0e'], ['#413620', '#9f7833']]

        self.very_different = [['#9ad2cb', '#feffbe'], ['#adf5ff', '#472836'], ['#e9724c', '#bdc696'], ['#143109', '#f5e9e2'], ['#89bd9e', '#f0c987']]

        self.mixed_palettes=[['#c2e7d9', '#263f8b'], ['#fc6dab', '#f7f6c5'], ['#98d2eb', '#b2b1cf'], ['#ffc09f', '#fcf5c7'], ['#119e0f2', '#52154e'], ['#124559', '#aec3b0']]

        self.monochrome_rgb =  [[ [250, 224, 181] ,[224, 159, 62] ] , [[158, 42, 43] ,[84, 11, 14] ], [[65, 54, 32] ,[159, 120, 51]]]

        self.very_different_rgb = [[[154, 210, 203],[254, 255, 190]],[[173, 245, 255], [71 , 40, 54]], [[233, 114, 76], [189, 198, 150]], [ [20, 49, 9], [245, 233, 226]], [[137, 189, 158],[240, 201, 135]]]

        self.mixed_palettes_rgb = [[[194, 231, 217],[38, 63, 139]],[[252, 109, 171],[247, 246, 197]],[[152, 210, 235],[178, 177, 207]],[[255, 192, 159],[252, 245, 199]],[[281, 224, 242],[82, 21, 78]],[[18, 69, 89],[174, 195, 176]]]


    def tearDown(self):
        self.gen = None

    """
    Asserts that if there's no liked palette, the hue shift is at most 20 (hyperparam)
    """
    def testHueShiftFromQuiz(self):
        hsl = self.gen.process_input(self.autumn, [], False)
        self.assertTrue(self.gen.generate_hue_shift() <=  20) 
        self.assertEqual(len(self.autumn), len(hsl))

        hsl = self.gen.process_input(self.neon, [], False)
        self.assertTrue(self.gen.generate_hue_shift() <=  20)
        self.assertEqual(len(self.neon), len(hsl))

        hsl = self.gen.process_input(self.underwater, self.monochrome_rgb, False)
        self.assertTrue(self.gen.generate_hue_shift() <=  20)
        self.assertEqual(len(self.underwater) + 2 * len(self.monochrome_rgb), len(hsl))

    """
    Asserts that the randomness index is computed correctly
    """
    def testRandomness(self):
        hsl = self.gen.process_input(self.autumn, [], False)
        self.assertEqual(round(self.gen.randomness, 3), round(1/(0.04 * len(self.autumn) + 1), 3))

        hsl = self.gen.process_input(self.neon, self.monochrome_rgb, False)
        self.assertEqual(round(self.gen.randomness, 3), round(1/(0.04 * (len(self.neon) + 2 * len(self.monochrome_rgb)) + 1), 3))

    """
    Asserts that the maximum saturation shift is maintianed
    """
    def testSaturationShift(self):
        palettes = self.gen.generate_palettes(self.underwater, [], 1, False)
        color1s = palettes[0][0][1]
        color2s = palettes[0][1][1]
        color3s = palettes[0][2][1]
        self.assertTrue( (abs(color1s - color2s) <=  0.2) or (abs(color2s - color3s) <=  0.2) )

    """
    Asserts that the hue shift is linear
    """
    def testHueIsLinear(self):
        palettes = self.gen.generate_palettes(self.underwater, [], 1, False)
        color1h = palettes[0][0][0]
        color2h = palettes[0][1][0]
        color3h = palettes[0][2][0]
        color4h = palettes[0][3][0]
        color5h = palettes[0][4][0]
        if (color1h < color2h and color2h < color3h) or (color1h > color2h and color2h > color3h):
            self.assertEqual(round(abs(color1h - color2h), 2), round(abs(color2h-color3h), 2))
        if (color3h < color4h and color4h < color5h) or (color3h > color4h and color4h > color5h):
            self.assertEqual(round(abs(color3h - color4h),2), round(abs(color4h - color5h),2))

        palettes = self.gen.generate_palettes(self.neon, self.mixed_palettes_rgb, 1, False)
        color1h = palettes[0][0][0]
        color2h = palettes[0][1][0]
        color3h = palettes[0][2][0]
        color4h = palettes[0][3][0]
        color5h = palettes[0][4][0]
        if (color1h < color2h and color2h < color3h) or (color1h > color2h and color2h > color3h):
            self.assertEqual(round(abs(color1h - color2h),2), round(abs(color2h-color3h),2))
        if (color3h < color4h and color4h < color5h) or (color3h > color4h and color4h > color5h):
            self.assertEqual(round(abs(color3h - color4h),2), round(abs(color4h - color5h), 2))

    """
    Asserts that lightness always increases towards the ned
    """
    def testLightnessIsMonotonic(self):
        palettes = self.gen.generate_palettes(self.autumn, self.monochrome_rgb, 1, False)
        color1l = palettes[0][0][2]
        color3l = palettes[0][2][2]
        color5l = palettes[0][4][2]
        self.assertTrue(color5l >= color3l)
        self.assertTrue(color3l >= color1l)

        palettes = self.gen.generate_palettes(self.autumn, self.very_different_rgb, 1, False)
        color1l = palettes[0][0][2]
        color3l = palettes[0][2][2]
        color5l = palettes[0][4][2]
        self.assertTrue(color5l >= color3l)
        self.assertTrue(color3l >= color1l)
    
    """
    If the generator is given palettes that are monochromatic, it will have a hue shift index
    significantly less than a hue shift of palettes with a lot different colors.
    """
    def testProcessInputHueShift(self):
        g1 = palette_generator()
        g2 = palette_generator()

        g1.process_input(self.underwater, self.monochrome_rgb, False)
        g2.process_input(self.underwater, self.very_different_rgb, False)
        self.assertTrue(g1.generate_hue_shift() <= g2.generate_hue_shift())

    """
    Tests that the generated palette will not generate
    the same color for the text and background.
    """
    def testNoSameColors(self):
        palettes = self.gen.generate_palettes(self.underwater, self.monochrome_rgb, 4, False)
        self.assertEqual(len(palettes), 4)
        for p in palettes:
            self.assertTrue(p[0] != p[-1])

        palettes = self.gen.generate_palettes(self.neon, self.very_different_rgb, 10, False)
        self.assertEqual(len(palettes), 10)
        for p in palettes:
            self.assertTrue(p[0] != p[-1])

        palettes = self.gen.generate_palettes(self.autumn, self.very_different_rgb, 10, False)
        self.assertEqual(len(palettes), 10)
        for p in palettes:
            self.assertTrue(p[0] != p[-1])

    """
    Test that no cards are leaked from outputs.
    """
    def testOutputGalleryCards(self):
        palettes = self.gen.generate_palettes(self.autumn, self.very_different_rgb, 10, False)
        cards = self.gen.output_to_gallery_cards(palettes)
        self.assertEqual(len(cards), 10)

    

        


    

if __name__ == "__main__":
    unittest.main()