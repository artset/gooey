import unittest
import sys
from gooey_server.palette_generator.color_library import color_library

"""
Tests for the color library, a utitility class that the generator uses
to do color conversions and string parsing.
"""
class TestColorLibrary(unittest.TestCase):

    def setUp(self):
        self.color_lib = color_library()

    def tearDown(self):
        self.color_lib = None

    def testRGBConversions(self):
        self.assertEqual(self.color_lib.rgb_to_hex(255, 255, 255), "#ffffff")
        self.assertEqual(self.color_lib.rgb_to_hex(0, 0, 0), "#000000")

        self.assertEqual(self.color_lib.rgb_to_string([33, 3, 0.53]), "(33, 3, 0.53)")
        self.assertEqual(self.color_lib.rgb_to_string([-.2, -33, 0.93]), "(-0.2, -33, 0.93)")

        self.assertEqual(self.color_lib.correct_rgb([4, 2, -2])[2], 0)
        self.assertEqual(self.color_lib.correct_rgb([4, 2, -2])[1], 2)
        self.assertEqual(self.color_lib.correct_rgb([4, 2, -2])[0], 4)

    def testValidateRGB(self):
        self.assertEqual(self.color_lib.is_valid_rgb([22, 23, 9]), True)
        self.assertEqual(self.color_lib.is_valid_rgb([-.4, 23, 9]), False)

    def testHSL(self):
        self.assertEqual(self.color_lib.is_valid_rgb([22, 23, 9]), True)
        self.assertEqual(self.color_lib.is_valid_rgb([-.4, 23, 9]), False)

    def testBounds(self):
        self.assertEqual(self.color_lib.bound(2, 9, -1), 2)
        self.assertEqual(self.color_lib.bound(2, 10, 11), 10)

    
    def testFormattingFunctions(self):

    def testGalleryToString(self):
        rgb = self.color_lib.arr_to_int([3.2, 4.4, 1.0])
        self.assertEqual(self.color_lib.arr_to_int(rgb), [3, 4, 1])
        self.assertEqual(self.color_lib.rgb_to_string(rgb), "(3, 4, 1)")

        answer = [2, -1, 5]
        proposed = self.color_lib.arr_to_int([2.2, -1.3, 4.9])
        for i in range(0, len(answer)):
            self.assertEqual(answer[i], proposed[i])

    def testColorLabels(self):
        self.assertEqual("grey", self.color_lib.color_descriptor(263, .07, .5))
        self.assertEqual("fog", self.color_lib.color_fun(263, .07, .5))
        self.assertEqual("purple", self.color_lib.color_descriptor(263, 1, .5))
        self.assertEqual("lilac", self.color_lib.color_fun(263, 1, .5))
        self.assertEqual("red", self.color_lib.color_descriptor(2, 1, .5))
        self.assertEqual("strawberry", self.color_lib.color_fun(2, 1, .5))
        self.assertEqual("grey", self.color_lib.color_descriptor(2, .02, .5))
        self.assertEqual("fog", self.color_lib.color_fun(2, .02, .5))



if __name__ == "__main__":
    unittest.main()