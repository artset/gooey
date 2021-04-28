import math
import sys
import json
import random as r
import numpy as np
from sklearn.mixture import GaussianMixture
from scipy import linalg

from backend.gooey_server.palette_generator.color_library import color_library


class palette_generator:
    """ 
    Class that represents the palette generator model. 

    USAGE: 
    generator = palette_generator()
    palettes = generator.generate_palettes(liked colors, liked palettes, number of palettes, ifPrint = False)
    gallery_cards = generator.output_to_gallery_cards(palettes)
    
    """

    def __init__(self):
        # Hyperparameters for the generator.
        self.color_library = color_library()
        self.color_gmm = GaussianMixture(n_components=3)
        self.hue_gmm = GaussianMixture(n_components=2)
        self.num_steps = 8
        self.num_palettes = 0
        self.randomness = .3 # Initial randomness, probability of starting with a random hue, to encourage exploration.
        self.hue_shift_max = 20 # Maximum shifting in hue per color(any larger makes an ugly palette!)
        self.saturation_shift_max = 0.2 # Maxiumum shifting in saturation per color
        
    """        
    Method that takes in hex colors from quiz and rgb palettes(gallery cards) that the user likes,
    converts all colors to hsl, and updates hyperparemeters such as randomness, num_palettes, and hue_gmm..

    Inputs:
    sample: is an array of hex values: ['hex', 'hex']
    palettes: is an array of (arrays of rgb) like [[[r, g, b], [r, g, b]], [[r, g, b], [r, g, b]]]
    if_print: Boolean set to false, used to prototype algorithm.

    Output: a list of hsl liked colors to be passed into the gmm
    """
    def process_input(self, samples, palettes, if_print):
        hsl_input = []
        
        if palettes == None:
            palettes = []
        for color in samples:
            color = self.color_library.hex_to_rgb(color) # added line to transform from hex to rgb
            if if_print: 
                self.color_library.print_combo(color, color)
            hsl_input.append(self.color_library.rgb_to_hsl(color[0], color[1], color[2]))
        
        # randomness: decreases randomness for every color we like
        self.num_palettes = len(palettes)
        num_inputs = len(samples) + 2 * len(palettes) # assuming each palette has 2 colors
        self.randomness = 1/(0.04 * num_inputs + 1) # over 25 input colors: < 0.5
        
        # hue shift (1-|1/pi * (x-pi)|) + hue_gmm
        hue_shifts = []
        for palette in palettes:
            rgb_color1 = palette[0]
            rgb_color2 = palette[1]
            if if_print:
                self.color_library.print_combo(rgb_color1, rgb_color2)
                self.color_library.print_combo(rgb_color2, rgb_color1)
            color1 = self.color_library.rgb_to_hsl(rgb_color1[0], rgb_color1[1], rgb_color1[2])
            color2 = self.color_library.rgb_to_hsl(rgb_color2[0], rgb_color2[1], rgb_color2[2])
            hsl_input.append(color1)
            hsl_input.append(color2)
            hue_diff = math.radians(abs(color1[0] - color2[0]))
            hue_shift = 1 - abs(1/math.pi*(hue_diff - math.pi))
            hue_shifts.append(hue_shift)
        if self.num_palettes >= 2:    
            hue_shifts = np.reshape(hue_shifts, (-1, 1))
            self.hue_gmm.fit(hue_shifts) 
        
        return hsl_input
    
    """
    Generate a hue index, and outputs a max number for a hue shift.
    (Helps determine the hue of the next colors in the palette.)
    """
    def generate_hue_shift(self):
        if self.num_palettes < 2:
            hue_shift_prop = np.clip(r.uniform(0, 1.1), 0, 1)
        else:
            hsi = np.clip(self.hue_gmm.sample(1)[0][0][0], 0, 1)
            if hsi > 0.4 and hsi < 0.6: # medium shift
                if r.random() < 0.3:
                    hue_shift_prop = abs(r.uniform(0, 0.4))
                elif r.random() > 0.7:
                    hue_shift_prop = abs(r.uniform(0.6, 1))
                else: # 40% of the time
                    hue_shift_prop = abs(r.uniform(0.4, 0.6))
            else:
                if r.random() < hsi:
                    hue_shift_prop = abs(r.uniform(hsi, 1))
                else:
                    hue_shift_prop = abs(r.uniform(0, hsi))
        return hue_shift_prop * self.hue_shift_max
        # 0.1: 10% (0.1, 1.0) | 90% (0, 0.1)
    
    """
    Helper function that allows the generator to explore other colors.
    This is called depending on the randomness hyperparameter.
    """
    def randomnize_given_color(self, color):
        if r.random() < self.randomness:
            new_hue = np.mod(color[0] + r.uniform(30, 100), 360)
            color[0] = new_hue
            new_saturation = self.saturation_clip(color[1] + r.uniform(-0.2, 0.2))
            color[1] = new_saturation
            new_lightness = np.clip(color[2] + r.uniform(-0.5, 0.5), 0, 1)
            color[2] =  new_lightness
        return color
    
    """
    Helper function that accounts for saturation wrapping (a scale from 0 to 1).
    """
    def saturation_clip(self, value):
        value = abs(value)
        direction = (-1)**int(value)
        return np.mod((1 + direction*np.mod(value, 1)), 1)
    
    """
    Interpolation function.

    Given a color, the stepping wheel determines the centroid (where in the palette it lies),
    and interpolates on hue, saturation, and lightness to create all the other colors in the palette.
    This is dependent on a number of steps, which is 5,8. Our stepping wheel can produce any number
    of steps. Keep in note the larger the palette, the higher the contrast between the first and 
    last colors.

    Input: A single color, [h,s,l]
    Output: An array of colors, where each represents a color in the palette.
    """
    def stepping_wheel(self, color):
        self.num_steps= round(r.uniform(5, 8)) # Heuristically determined to be the best for our purposes.
        rgb = self.color_library.hsl_to_rgb(color[0], color[1], color[2]) # for printing
        # randomnize colors based on self.randomness to get more diverse outputs
        color = self.randomnize_given_color(color)
        rgb = self.color_library.hsl_to_rgb(color[0], color[1], color[2]) # for printing
        # center_i : determines the placement of the sampled color in the palette based on lightness
        # center_i = round(self.num_steps/2 + 0.1)-1
        lightness = color[2]
        if r.random() < 0.4 and lightness >= 0.3 and lightness <= 0.5: # enabling medium colors to be near the darker end sometimes
            lightness = lightness + r.uniform(-0.4, 0)
        if r.random() < 0.4 and lightness >= 0.65 and lightness <= 0.8: # enabling medium colors to be near the lightner end sometimes
            lightness = lightness + r.uniform(0, 0.3)
        np.clip(lightness, 0, 1)
        center_i = round(self.num_steps* (1/(1.0 + np.exp(3-5*lightness)))**1.2) # modified sigmoid
        center_i = np.clip(int(center_i), 0, self.num_steps-1)
        
        # hue: linear increase/decrease -> x, -x (2 possibilities)
        palette_h = np.zeros(self.num_steps)
        hue_shift = self.generate_hue_shift()
        dire = 1 if r.random() > 0.5 else -1
        for i in range(0, self.num_steps):
            value = color[0] + (i - center_i) * dire * hue_shift
            palette_h[i] = value
        palette_h = np.mod(palette_h, 360)
        
        # new saturation: proportional decrease/increase -> x^2, -x^2, x^3, -x^3 (4 possibilities)
        palette_s = np.zeros(self.num_steps)         
        palette_s[center_i] = color[1]
        last = palette_s[center_i]
        left_dir = 1 if r.random() > 0.5 else -1
        for i in range(center_i - 1, -1, -1): # left
            prop = 1.0/(1 + np.exp(-abs(i - center_i)/5.0))  # sigmoid
            value = last + left_dir * self.saturation_shift_max * prop
            last = value # saturation of current element to be used in the next iteration
            palette_s[i] = self.saturation_clip(value)
        last = palette_s[center_i]
        right_dir = 1 if r.random() > 0.5 else -1
        for i in range(center_i + 1, self.num_steps, 1): # right
            prop = 1.0/(1 + np.exp(-abs(i - center_i)/5.0)) 
            value = last + right_dir * self.saturation_shift_max * prop
            last = value # saturation of current element to be used in the next iteration
            palette_s[i] = self.saturation_clip(value)
        palette_s = np.clip(palette_s, 0.01, 0.99)
    
        # brightness/lightness: logarithmic -> a*log(x), a in [0.3, 1] (increasing)
        palette_b = np.zeros(self.num_steps)
        palette_b[center_i] = np.clip(color[2], 0.01, 0.95) # given middle color
        delta_x = 0.05
        # setting a in the a*log(x) + 1
        if (color[2] > 0.49 and color[2] < 0.51): # heuristics for setting the rate of change of brightness
            a = 1.585
        else:
            a = abs(0.1/(color[2]-0.5))**0.2 
        for i in range(center_i - 1, -1, -1): # left
            last = palette_b[i + 1] # brightness of last element
            palette_b[i] = np.clip((last - delta_x * (a/last)**0.5), 0.01, 0.95) # derivative of a*log(x)+1  
        for i in range(center_i + 1, self.num_steps, 1): # right   
            last = palette_b[i - 1] # brightness of last element
            palette_b[i] = np.clip((last + delta_x * (a/last)**0.5), 0.01, 0.95) # derivative of a*log(x)+1
        palette_b = np.clip(palette_b, 0.01, 0.95)
        
        # combining h, s, b
        palette = []
        for i in range(0, self.num_steps):
            c = [palette_h[i], palette_s[i], palette_b[i]]
            palette.append(c)
            rgb = self.color_library.hsl_to_rgb(c[0], c[1], c[2]) # for printing

        return palette
    
    
    """
    Our Gaussian Mixture Model clusters on input colors, and is sampled on to produce similar colors.
    Given a list of inputs [colors] that are in hsl form [[h,s,l], [h,s,l], [h,s,l] ...]
    Outputs colors in HSL: [[h,s,l], [h,s,l], [h,s,l]...]
    """
    def sample_gmm(self, hsl_input, num_samples):
        hsl_input = np.reshape(hsl_input, (-1, 3)) # 3 columns
        self.color_gmm.fit(hsl_input)
        samples = self.color_gmm.sample(num_samples)[0]
        for sample in samples:
            sample[0] = np.clip(sample[0], 0, 360)
            sample[1] = np.clip(sample[1], 0, 1)
            sample[2] = np.clip(sample[2], 0, 1)
        return samples
    
    """
    Master function that is called to generate palettes. Given a list of liked_colors (Hex strings)
    Liked palettes (rgb tuples), and a number of palettes, it will output palettes in 
    HSL space.

    Output: [[[h,s,l], [h,s,l]...], [[h,s,l], [h,s,l] ...]].

    """
    def generate_palettes(self, liked_colors, liked_palettes, num_palettes, if_print):
        hsl_input = self.process_input(liked_colors, liked_palettes, if_print)
        gmm_samples = self.sample_gmm(hsl_input, num_palettes)
        palettes = []
        for color in gmm_samples: # make a palette for each sample from the gmm
            p = self.stepping_wheel(color)
            palettes.append(p)
            if if_print:
                rgb1 = self.color_library.hsl_to_rgb(p[0][0], p[0][1], p[0][2])
                rgb2 = self.color_library.hsl_to_rgb(p[self.num_steps - 1][0], p[self.num_steps - 1][1], p[self.num_steps - 1][2])
                self.color_library.print_combo(rgb1, rgb2)
                self.color_library.print_combo(rgb2, rgb1)
        return palettes
    
    """
    Helper function that translates generated palettes (hsl space) into a json file
    that goes into the database, and easily renders in the front end.
    """
    def output_to_gallery_cards(self, palettes):
        print("in output to gallery cards")
        outputs = []
        # print(sys.path[0])
        # with open(sys.path[0] + '/backend/gooey_server/palette_generator/font_data.json') as f:
        #     font_data = json.load(f)
        # print("is this not working: 260?")

        font_data = {
            "Alegreya": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Alegreya Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Andada": {
                "type": "serif",
                "style": [
                    "regular"
                ]
            },
            "Antic Slab": {
                "type": "serif",
                "style": [
                    "regular"
                ]
            },
            "Asap": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Assistant": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Average": {
                "type": "serif",
                "style": [
                    "regular"
                ]
            },
            "Average Sans": {
                "type": "sans-serif",
                "style": [
                    "regular"
                ]
            },
            "Baskervville": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic"
                ]
            },
            "Bitter": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold"
                ]
            },
            "Cabin": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Cantarell": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Carme": {
                "type": "sans-serif",
                "style": [
                    "regular"
                ]
            },
            "Copse": {
                "type": "serif",
                "style": [
                    "regular"
                ]
            },
            "Crimson Text": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "DM Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "EB Garamond": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold",
                    "italic",
                    "bold italic"
                ]
            },
            "Fira Mono": {
                "type": "monospace",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Gudea": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold"
                ]
            },
            "Inconsolata": {
                "type": "monospace",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Josefin Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "bold",
                    "italic",
                    "bold italic"
                ]
            },
            "Josefin Slab": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Karla": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Karma": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Kreon": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Lato": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Libre Baskerville": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold"
                ]
            },
            "Lora": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold",
                    "italic",
                    "bold italic"
                ]
            },
            "Markazi Text": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Montserrat": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Mukta Malar": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Neuton": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold"
                ]
            },
            "Noto Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Nunito": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Old Standard TT": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold"
                ]
            },
            "Open Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Overpass Mono": {
                "type": "monospace",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "PT Serif": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Poly": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic"
                ]
            },
            "Quando": {
                "type": "serif",
                "style": [
                    "regular"
                ]
            },
            "Quattrocento": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Quattrocento Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Raleway": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Roboto": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Roboto Slab": {
                "type": "serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Rosarivo": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic"
                ]
            },
            "Sen": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Source Code Pro": {
                "type": "monospace",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Source Sans Pro": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Sunflower": {
                "type": "sans-serif",
                "style": [
                    "bold"
                ]
            },
            "Tajawal": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "bold"
                ]
            },
            "Ubuntu": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Vollkorn": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            },
            "Work Sans": {
                "type": "sans-serif",
                "style": [
                    "regular",
                    "bold",
                    "italic",
                    "bold italic"
                ]
            },
            "Zilla Slab": {
                "type": "serif",
                "style": [
                    "regular",
                    "italic",
                    "bold",
                    "bold italic"
                ]
            }
        }
            
        font_names = list(font_data.keys())
        
        for palette in palettes:
            color_id = []
            p = {}
            p["colors"] = {}
            p["colors"]["hex"] = []
            p["colors"]["rgb"] = []
            p["colors"]["labels"] = []
            p["colors"]["fun"] = []
            p["title"] = {}
            p["body"] = {}
            
            two_tone = [ palette[0], palette[len(palette) - 1]]
            for color in two_tone:
                rgb = self.color_library.hsl_to_rgb(color[0], color[1], color[2])
                rgb_string =  self.color_library.rgb_to_string(self.color_library.arr_to_int(rgb))
                
                hex_color = self.color_library.rgb_to_hex(rgb[0], rgb[1], rgb[2])
                label = self.color_library.color_descriptor(color[0], color[1], color[2])
                fun_label = self.color_library.color_fun(color[0], color[1], color[2])
                
                # adds all the color data
                p["colors"]["hex"].append(hex_color)
                p["colors"]["rgb"].append(rgb_string)
                p["colors"]["labels"].append(label)
                p["colors"]["fun"].append(fun_label)
                
            # adds title and body information
            text_color = 1 if r.random() > .5 else 0
            bg_color = 0 if text_color == 1 else 1
             
            title_font = r.choice(font_names)
            p["title"]["font"] = title_font
            p["title"]["type"] =  font_data[title_font]["type"]
            p["title"]["color"] = text_color
            
            body_font = r.choice(font_names)
            p["body"]["font"] = body_font
            p["body"]["type"] =  font_data[body_font]["type"]
            p["body"]["color"] = text_color
            
            p["background"] = bg_color
            
            p["heart"] = False
            outputs.append(p)
        return outputs
    
        