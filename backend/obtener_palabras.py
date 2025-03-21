import nltk
from nltk.corpus import wordnet as wn

def obtener_palabras():
    palabras = []
    for synset in wn.all_synsets(lang='spa'):
        for lemma in synset.lemmas(lang='spa'):
            palabras.append(lemma.name())
    return palabras