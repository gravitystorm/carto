@var: 'foo';

#world {
  @var: 'oof';
  [zoom >= 5] {
      @var: 'roof';
  }
  text-face-name: 'Arial';
  text-name: @var + 'bar';
}
