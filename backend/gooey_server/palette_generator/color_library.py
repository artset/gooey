from colormath.color_objects import LabColor, XYZColor, sRGBColor, HSLColor, AdobeRGBColor
from colormath.color_conversions import convert_color
from colr import Colr as C
from copy import copy, deepcopy
from matplotlib.colors import hex2color, rgb2hex
import numpy as np


import itertools


class color_library:
    """ 
    Class that represents a color library. The palette generator
    uses these utility library for conversions.
    """

    """
    Inputs r,g,b doubles -> outputs: [h,s, l]
    """
    def rgb_to_hsl(self, a, b, c):
        rgb = sRGBColor(a, b, c, is_upscaled=True)
        hsl = convert_color(rgb, HSLColor)
        return hsl.get_value_tuple()
    
    """
    Input: a hex string like "#FFFFFF", outputs: [r,g,b]
    """
    def hex_to_rgb(self, hex_str):
        rgb_color = hex2color(hex_str)
        upscaled_rgb = [i * 255 for i in rgb_color]
#         print("hex:", hex_str)
        rgb_color = hex2color(hex_str)
        upscaled_rgb = [i * 255 for i in rgb_color]
#         print("upscaled rgb:", upscaled_rgb)
        return upscaled_rgb

    """
    Input: h, s, l doubles -> outputs: [r,g,b]
    """
    def hsl_to_rgb(self, a, b, c):
        hsl = HSLColor(a, b, c)
        rgb = convert_color(hsl, sRGBColor).get_value_tuple()
        if not self.is_valid_rgb(rgb):
            return self.correct_rgb([rgb[0]*255, rgb[1]*255, rgb[2]*255])
        return self.correct_rgb([rgb[0]*255, rgb[1]*255, rgb[2]*255])
    
    """
    Returns true if it's a valid rgb array.
    """
    def is_valid_rgb(self, color):
        if len(color) != 3:
            return False
        for param in color:
            if param < 0 or param > 255:
                return False
        return True
    
    """
    Given an array, and clips the end in regards to RGB.
    """
    def correct_rgb(self, color):
        color = np.asarray(color)
        for i in range(len(color)):
            if color[i] < 0:
                color[i] = 0
            if color[i] > 255:
                color[i] = 255
        return color
    
    """
    Given an rgb array, returns it in string format
    for rendering.
    Input: [r, g, b] -> Output: "(r, g, b)"
    """
    def rgb_to_string(self, rgb):
        rgb_string = "("
        for c in rgb:
            rgb_string += str(c) + ", "
            
        rgb_string = rgb_string[: len(rgb_string) - 2]
        return rgb_string + ")"

    """
    Given an array, casts to an integer array and rounds.
    """
    def arr_to_int(self, arr):
        new_arr = []
        for r in range(len(arr)):
            new_arr.append(int(round(arr[r])))
        return new_arr

    """
    Function used in the original prototyping demo to assist with printing colors to the commandline.
    """
    def print_combo(self, fg, bg):
        for i in range(0,3):
            if fg[i] > 255:
                fg[i] = 255
            if bg[i] > 255:
                bg[i]= 255
        print(C().b_rgb(bg[0], bg[1], bg[2]) .rgb(fg[0], fg[1], fg[2], 'Lorem ipsum.'))

    """
    Function that clips a number if it goes out of bounds.
    """
    def bound(self, min_val, max_val, val):
        new_val = val
        if (val > max_val):
             new_val = max_val
        elif (val < min_val):
            new_val = min_val
        return new_val

    """
    Function that converts from RGB color space to hex.
    """
    def rgb_to_hex(self, r,g,b):
        return '#%02x%02x%02x' % (int(r), int(g), int(b))
    
    """
    Function that takes in a color, and returns a color descriptor.
    Used to label gallery cards.
    """
    def color_descriptor(self, hue, saturation, lightness):
        if saturation < .10:
            return "grey"
        if lightness < .05:
            return "black"
        elif lightness > .97:
            return "white"
        elif hue >= 20 and hue <= 40 and lightness >= .1 and lightness <= .4:
            return "brown"
        elif hue <= 10 or hue >= 350:
            return "red"
        elif hue < 40:
            return "orange"
        elif hue < 70:
            return "yellow"
        elif hue < 160:
            return "green"
        elif hue < 250:
            return "blue"
        elif hue < 290:
            return "purple"
        elif hue < 350:
            return "pink"
    
    """
    Function that takes in a color, and returns a fun themed color descriptor.
    Used to label gallery cards.
    """
    def color_fun(self, hue, saturation, lightness):
        if saturation < .10:
            return "fog"
        if lightness < .05:
            return "licorice"
        elif lightness == .98:
            return "snow"
        elif hue >= 20 and hue <=40 and lightness >= .1 and lightness <= .4:
            return "chocolate"
        elif hue <= 10 or hue >= 350:
            return "strawberry"
        elif hue < 40:
            return "mango"
        elif hue < 70:
            return "lemon"
        elif hue < 160:
            return "lime"
        elif hue < 250:
            return "blueberry"
        elif hue < 290:
            return "lilac"
        elif hue < 350:
            return "rose"


